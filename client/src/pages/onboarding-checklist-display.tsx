import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Clock, AlertCircle, FileCheck, Eye, Brain, Edit } from 'lucide-react';
import { ChecklistItemCard } from '@/components/ChecklistItemCard';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { isUnauthorizedError } from '@/lib/authUtils';
import { OnboardingChecklist } from '@shared/schema';

interface OnboardingChecklistDisplayProps {
  employeeId: number;
  isHRView?: boolean;
  onEdit?: (checklist: OnboardingChecklist) => void;
}

export function OnboardingChecklistDisplay({ employeeId, isHRView = false, onEdit }: OnboardingChecklistDisplayProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: checklists, isLoading } = useQuery({
    queryKey: [`/api/onboarding/${employeeId}`],
    retry: false,
  });

  const toggleItemMutation = useMutation({
    mutationFn: async ({ id, isCompleted }: { id: number; isCompleted: boolean }) => {
      return await apiRequest(`/api/onboarding/${id}`, {
        method: 'PUT',
        body: { isCompleted }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/onboarding/${employeeId}`] });
      toast({
        title: "Success",
        description: "Checklist item updated successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update checklist item",
        variant: "destructive",
      });
    },
  });

  const uploadDocumentMutation = useMutation({
    mutationFn: async ({ itemId, fileData }: { itemId: number; fileData: { url: string; name: string } }) => {
      return await apiRequest(`/api/onboarding/${itemId}/upload`, {
        method: 'POST',
        body: {
          documentUrl: fileData.url,
          documentName: fileData.name
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/onboarding/${employeeId}`] });
      toast({
        title: "Success",
        description: "Document uploaded successfully and is pending verification",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to upload document",
        variant: "destructive",
      });
    },
  });

  const verifyDocumentMutation = useMutation({
    mutationFn: async ({ itemId, isVerified, notes }: { itemId: number; isVerified: boolean; notes?: string }) => {
      return await apiRequest(`/api/onboarding/${itemId}/verify`, {
        method: 'POST',
        body: {
          isVerified,
          verificationNotes: notes
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/onboarding/${employeeId}`] });
      toast({
        title: "Success",
        description: "Document verification updated successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to verify document",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!checklists || checklists.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <AlertCircle className="mx-auto mb-4 text-gray-400" size={64} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No checklist items found</h3>
          <p className="text-gray-600">
            No onboarding checklist has been created for this employee yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  const totalItems = checklists.length;
  const completedItems = checklists.filter((item: OnboardingChecklist) => item.isCompleted).length;
  const pendingDocuments = checklists.filter((item: OnboardingChecklist) => 
    item.requiresDocument && item.documentUrl && !item.isDocumentVerified
  ).length;
  const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  // Group checklist items by category based on order
  const groupedItems = checklists.reduce((groups: Record<string, OnboardingChecklist[]>, item: OnboardingChecklist) => {
    let category = 'Other';
    if (item.order <= 5) category = 'Pre-arrival Setup';
    else if (item.order <= 11) category = 'Day 1 - Welcome & Orientation';
    else if (item.order <= 18) category = 'Week 1 - Documentation & Training';
    else if (item.order <= 23) category = 'Week 2 - Role-Specific Training';
    else if (item.order <= 28) category = 'Month 1 - Integration & Assessment';
    else if (item.order <= 32) category = 'Ongoing - Long-term Integration';
    
    if (!groups[category]) groups[category] = [];
    groups[category].push(item);
    return groups;
  }, {});

  const handleToggleComplete = (id: number, isCompleted: boolean) => {
    toggleItemMutation.mutate({ id, isCompleted });
  };

  const handleFileUploaded = (itemId: number, fileData: { url: string; name: string }) => {
    uploadDocumentMutation.mutate({ itemId, fileData });
  };

  const handleVerifyDocument = (itemId: number, isVerified: boolean, notes?: string) => {
    verifyDocumentMutation.mutate({ itemId, isVerified, notes });
  };

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Onboarding Progress</span>
            <Badge variant={progress === 100 ? "default" : "secondary"}>
              {completedItems}/{totalItems} Complete
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Progress value={progress} className="w-full" />
            <div className="flex justify-between text-sm text-gray-600">
              <span>{progress}% Complete</span>
              {pendingDocuments > 0 && (
                <span className="text-yellow-600">
                  <FileCheck className="w-4 h-4 inline mr-1" />
                  {pendingDocuments} documents pending verification
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Checklist Items by Category */}
      {Object.entries(groupedItems).map(([category, items]) => (
        <div key={category}>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{category}</h3>
          <div className="space-y-4">
            {items.map((item: OnboardingChecklist) => (
              <div key={item.id} className="relative">
                <ChecklistItemCard
                  item={item}
                  onToggleComplete={handleToggleComplete}
                  onFileUploaded={handleFileUploaded}
                  disabled={toggleItemMutation.isPending || uploadDocumentMutation.isPending}
                />
                {isHRView && onEdit && (
                  <div className="absolute top-2 right-2">
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => onEdit(item)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                )}
                {isHRView && item.requiresDocument && item.documentUrl && (
                  <div className="mt-2 p-3 bg-blue-50 rounded border border-blue-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-blue-900">HR Verification Required</span>
                      <div className="space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleVerifyDocument(item.id, false, "Document needs revision")}
                          disabled={verifyDocumentMutation.isPending}
                        >
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleVerifyDocument(item.id, true, "Document approved")}
                          disabled={verifyDocumentMutation.isPending}
                        >
                          <FileCheck className="w-4 h-4 mr-1" />
                          Verify
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
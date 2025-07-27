// Simple script to seed psychometric test data
import { Pool } from '@neondatabase/serverless';

async function seedPsychometricData() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  try {
    console.log('Creating sample psychometric test...');
    
    // Create a personality test
    const testResult = await pool.query(`
      INSERT INTO psychometric_tests (test_name, test_type, description, instructions, time_limit, total_questions, is_active)
      VALUES (
        'Big Five Personality Assessment',
        'personality',
        'A comprehensive personality assessment based on the Big Five personality traits model.',
        'Please answer each question honestly based on how you generally feel and behave. There are no right or wrong answers.',
        30,
        20,
        true
      )
      RETURNING id;
    `);
    
    const testId = testResult.rows[0].id;
    console.log('Created test with ID:', testId);
    
    // Create sample questions
    const questions = [
      {
        text: "I am the life of the party.",
        type: "scale",
        category: "Extraversion",
        order: 1
      },
      {
        text: "I feel little concern for others.",
        type: "scale", 
        category: "Agreeableness",
        order: 2
      },
      {
        text: "I am always prepared.",
        type: "scale",
        category: "Conscientiousness", 
        order: 3
      },
      {
        text: "I get stressed out easily.",
        type: "scale",
        category: "Neuroticism",
        order: 4
      },
      {
        text: "I have a rich vocabulary.",
        type: "scale",
        category: "Openness",
        order: 5
      },
      {
        text: "I don't talk a lot.",
        type: "scale",
        category: "Extraversion",
        order: 6
      },
      {
        text: "I am interested in people.",
        type: "scale",
        category: "Agreeableness",
        order: 7
      },
      {
        text: "I leave my belongings around.",
        type: "scale",
        category: "Conscientiousness",
        order: 8
      },
      {
        text: "I am relaxed most of the time.",
        type: "scale",
        category: "Neuroticism",
        order: 9
      },
      {
        text: "I have difficulty understanding abstract ideas.",
        type: "scale",
        category: "Openness",
        order: 10
      },
      {
        text: "I feel comfortable around people.",
        type: "scale",
        category: "Extraversion",
        order: 11
      },
      {
        text: "I insult people.",
        type: "scale",
        category: "Agreeableness",
        order: 12
      },
      {
        text: "I pay attention to details.",
        type: "scale",
        category: "Conscientiousness",
        order: 13
      },
      {
        text: "I worry about things.",
        type: "scale",
        category: "Neuroticism",
        order: 14
      },
      {
        text: "I have a vivid imagination.",
        type: "scale",
        category: "Openness",
        order: 15
      },
      {
        text: "I keep in the background.",
        type: "scale",
        category: "Extraversion",
        order: 16
      },
      {
        text: "I sympathize with others' feelings.",
        type: "scale",
        category: "Agreeableness",
        order: 17
      },
      {
        text: "I make a mess of things.",
        type: "scale",
        category: "Conscientiousness",
        order: 18
      },
      {
        text: "I seldom feel blue.",
        type: "scale",
        category: "Neuroticism",
        order: 19
      },
      {
        text: "I am not interested in abstract ideas.",
        type: "scale",
        category: "Openness",
        order: 20
      }
    ];
    
    console.log('Creating questions...');
    for (const question of questions) {
      await pool.query(`
        INSERT INTO psychometric_questions (test_id, question_text, question_type, category, "order")
        VALUES ($1, $2, $3, $4, $5)
      `, [testId, question.text, question.type, question.category, question.order]);
    }
    
    console.log('Successfully seeded psychometric test data!');
    console.log('Test ID:', testId);
    console.log('Total questions:', questions.length);
    
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await pool.end();
  }
}

// Run the seed script
seedPsychometricData();
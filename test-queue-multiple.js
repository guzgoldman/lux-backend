require('dotenv').config();
const { enqueueEmail } = require('./src/queues/email.queue');

async function testMultipleEmails() {
  try {
    console.log('🚀 Iniciando prueba masiva de emails...\n');

    // Array de emails de prueba
    const emails = [
      {
        to: 'guzmanhector211@gmail.com',
        subject: 'Email inmediato #1',
        text: 'Este email se procesa inmediatamente',
        html: '<h2>Email #1</h2><p>Prioridad alta, sin delay</p>',
        priority: 1, // Alta prioridad
        delay: 0
      },
      {
        to: 'guzmanhector211@gmail.com', 
        subject: 'Email con delay #2',
        text: 'Este email tiene 5 segundos de delay',
        html: '<h2>Email #2</h2><p>Con delay de 5 segundos</p>',
        priority: 3,
        delay: 5000 // 5 segundos
      },
      {
        to: 'guzmanhector211@gmail.com',
        subject: 'Email baja prioridad #3',
        text: 'Este email tiene baja prioridad',
        html: '<h2>Email #3</h2><p>Baja prioridad, se procesa después</p>',
        priority: 5, // Baja prioridad
        delay: 0
      },
      {
        to: 'guzmanhector211@gmail.com',
        subject: 'Email con delay largo #4', 
        text: 'Este email se envía después de 10 segundos',
        html: '<h2>Email #4</h2><p>Delay de 10 segundos</p>',
        priority: 2,
        delay: 10000 // 10 segundos
      },
      {
        to: 'guzmanhector211@gmail.com',
        subject: 'Email inmediato #5',
        text: 'Otro email inmediato',
        html: '<h2>Email #5</h2><p>Sin delay, prioridad normal</p>',
        priority: 3,
        delay: 0
      }
    ];

    // Encolar todos los emails
    console.log('📝 Encolando emails...\n');
    const jobs = [];

    for (let i = 0; i < emails.length; i++) {
      const email = emails[i];
      console.log(`📧 Encolando: ${email.subject} (prioridad: ${email.priority}, delay: ${email.delay}ms)`);
      
      const job = await enqueueEmail(
        {
          to: email.to,
          subject: email.subject,
          text: email.text,
          html: email.html
        },
        {
          priority: email.priority,
          delay: email.delay
        }
      );
      
      jobs.push({ id: job.id, subject: email.subject });
      
      // Pequeña pausa entre encolar para ver mejor el orden
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log('\n✅ Todos los emails encolados:');
    jobs.forEach(job => {
      console.log(`   - Job ID ${job.id}: ${job.subject}`);
    });

    console.log('\n🔄 Observa los logs del worker para ver el orden de procesamiento...');
    console.log('💡 Deberías ver:');
    console.log('   1. Emails sin delay por orden de prioridad (1 > 2 > 3 > 5)');
    console.log('   2. Email #2 después de 5 segundos');
    console.log('   3. Email #4 después de 10 segundos');

    // Esperar 15 segundos para ver todos los procesamientos
    setTimeout(() => {
      console.log('\n✨ Prueba completada. Revisa los logs del worker!');
      process.exit(0);
    }, 15000);

  } catch (error) {
    console.error('❌ Error durante la prueba:', error);
    process.exit(1);
  }
}

// Función adicional para stress test
async function stressTest() {
  try {
    console.log('⚡ Iniciando stress test (50 emails)...\n');
    
    const promises = [];
    for (let i = 1; i <= 50; i++) {
      const promise = enqueueEmail({
        to: 'guzmanhector211@gmail.com',
        subject: `Stress Test Email #${i}`,
        text: `Email número ${i} del stress test`,
        html: `<h3>Email #${i}</h3><p>Parte del stress test de 50 emails</p>`
      });
      promises.push(promise);
    }
    
    const jobs = await Promise.all(promises);
    console.log(`✅ ${jobs.length} emails encolados simultáneamente!`);
    console.log('🔄 El worker los procesará uno por uno...');
    
    setTimeout(() => process.exit(0), 5000);
    
  } catch (error) {
    console.error('❌ Error en stress test:', error);
    process.exit(1);
  }
}

// Elegir qué prueba ejecutar
const testType = process.argv[2];

if (testType === 'stress') {
  stressTest();
} else {
  testMultipleEmails();
}
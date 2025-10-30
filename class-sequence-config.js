// Class Sequence Configuration
// Use this file to configure your own class sequences for web scraping

const PolygonService = require('./src/services/polygonService');

// Example configurations - modify these or add your own
const classSequenceConfigs = {
  // Simple single-class sequences
  simple: {
    'singleClass': ['JwB6zf'],
    'anotherSingle': ['NiCa2d'],
    'priceClass': ['YMlKec']
  },
  
  // Multi-step sequences (parent -> child -> grandchild)
  multiStep: {
    'nestedSequence': ['div', 'span', 'JwB6zf'],
    'containerSequence': ['XOK1Oe', 'JwB6zf', 'V7hZne'],
    'deepNested': ['body', 'div', 'div', 'span', 'JwB6zf']
  },
  
  // Google Finance specific sequences
  googleFinance: {
    'defaultGoogle': ['LbSHKc', 'XOK1Oe', 'JwB6zf V7hZne'],
    'alternativeGoogle': ['JwB6zf', 'V7hZne'],
    'priceGoogle': ['YMlKec', 'fxKbKc']
  },
  
  // Yahoo Finance specific sequences
  yahooFinance: {
    'yahooPrice': ['Trsdu(0.3s)', 'Fw(b)', 'Fz(36px)'],
    'yahooChange': ['Trsdu(0.3s)', 'Fw(500)', 'Pstart(10px)']
  },
  
  // Custom sequences for specific use cases
  custom: {
    'myCustom1': ['your-class-here'],
    'myCustom2': ['parent-class', 'child-class'],
    'myCustom3': ['step1', 'step2', 'step3', 'target-class']
  }
};

// Function to apply all configurations
function applyClassSequences() {
  console.log('🔧 Applying class sequence configurations...\n');
  
  let totalSequences = 0;
  
  // Apply each category of sequences
  Object.entries(classSequenceConfigs).forEach(([category, sequences]) => {
    console.log(`📁 Applying ${category} sequences:`);
    
    Object.entries(sequences).forEach(([name, sequence]) => {
      const fullName = `${category}_${name}`;
      PolygonService.setCustomClassSequence(fullName, sequence);
      console.log(`  ✅ ${fullName}: [${sequence.join(' -> ')}]`);
      totalSequences++;
    });
    console.log();
  });
  
  console.log(`🎉 Applied ${totalSequences} class sequences total\n`);
  
  // Show all available sequences
  console.log('📋 All available sequences:');
  const allSequences = PolygonService.getAvailableSequences();
  allSequences.forEach(seq => {
    console.log(`  - ${seq.name}: [${seq.sequence.join(', ')}]`);
  });
  
  return allSequences;
}

// Function to test a specific sequence
async function testSequence(sequenceName, symbol = 'NVDA') {
  console.log(`🧪 Testing sequence "${sequenceName}" with symbol ${symbol}...`);
  
  try {
    // Get HTML
    const response = await require('axios').get(`https://www.google.com/finance/quote/${symbol}:NASDAQ`, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    
    const html = response.data;
    const result = PolygonService.testClassSequence(html, sequenceName, symbol);
    
    if (result.found) {
      console.log(`  ✅ Found: "${result.changePercent}" (step ${result.step})`);
      console.log(`  📊 Full sequence: [${result.fullSequence.join(' -> ')}]`);
    } else {
      console.log(`  ❌ Failed at step ${result.step}: ${result.missingClass}`);
    }
    
    return result;
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
    return { found: false, error: error.message };
  }
}

// Function to test all sequences
async function testAllSequences(symbol = 'NVDA') {
  console.log(`🧪 Testing all sequences with symbol ${symbol}...\n`);
  
  const sequences = PolygonService.getAvailableSequences();
  const results = {};
  
  for (const seq of sequences) {
    if (seq.sequence.length > 0) {
      const result = await testSequence(seq.name, symbol);
      results[seq.name] = result;
      console.log();
    }
  }
  
  // Summary
  console.log('📊 Test Results Summary:');
  const successful = Object.values(results).filter(r => r.found).length;
  const total = Object.keys(results).length;
  console.log(`  ✅ Successful: ${successful}/${total}`);
  
  Object.entries(results).forEach(([name, result]) => {
    const status = result.found ? '✅' : '❌';
    const info = result.found ? `"${result.changePercent}"` : `failed at step ${result.step}`;
    console.log(`  ${status} ${name}: ${info}`);
  });
  
  return results;
}

// Export functions for use
module.exports = {
  applyClassSequences,
  testSequence,
  testAllSequences,
  classSequenceConfigs
};

// If run directly, apply configurations and test
if (require.main === module) {
  console.log('🚀 Running class sequence configuration...\n');
  
  // Apply all configurations
  applyClassSequences();
  
  // Test a few sequences
  console.log('🧪 Testing a few sequences...\n');
  testSequence('googleFinance_defaultGoogle', 'NVDA').then(() => {
    console.log('\n🎉 Configuration complete!');
    console.log('\n💡 Usage examples:');
    console.log('  - Add your own sequences to classSequenceConfigs');
    console.log('  - Use testSequence("your-sequence-name", "SYMBOL") to test');
    console.log('  - Use testAllSequences("SYMBOL") to test everything');
  });
}





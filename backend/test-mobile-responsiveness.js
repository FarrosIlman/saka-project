const http = require('http');

const BASE_URL = 'http://localhost:5000/api';

// Helper function untuk request
const makeRequest = (method, path, data = null, token = null) => {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: JSON.parse(responseData)
          });
        } catch (e) {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
};

// Mobile viewport sizes untuk testing
const viewportSizes = [
  { name: 'Mobile (iPhone)', width: 375, height: 667 },
  { name: 'Tablet (iPad)', width: 768, height: 1024 },
  { name: 'Desktop', width: 1024, height: 768 }
];

// Responsive design checklist
const responsiveChecklist = {
  'Mobile (iPhone)': {
    'Login Form': {
      inputPadding: '12px 15px',
      buttonHeight: '>=48px',
      marginBottom: '>=20px'
    },
    'Quiz Page': {
      questionFontSize: '>=16px',
      optionButtonHeight: '>=44px',
      skeletonLoaderWidth: '100%'
    },
    'Admin Pages': {
      tableScrollable: true,
      actionButtonSize: '>=44px'
    },
    'Toast Notifications': {
      minHeight: '>=44px',
      visible: true
    }
  },
  'Tablet (iPad)': {
    'Admin Sidebar': {
      responsive: true,
      collapseOnSmall: true
    },
    'Data Tables': {
      minWidth: '100%',
      scrollableIfNeeded: true
    },
    'Forms': {
      columnLayout: '2-column if space',
      inputWidth: '100%'
    }
  },
  'Desktop': {
    'Full Layout': true,
    'Multi-column Pages': true,
    'All Features': true
  }
};

// Responsive components checklist
const componentsToTest = [
  {
    name: 'Toast Component',
    checklist: [
      '✓ Min height 44px for mobile touch',
      '✓ Visible on all viewports',
      '✓ Not cut off by notch/safe areas',
      '✓ z-index high enough',
      '✓ Auto-dismiss working',
      '✓ Icons visible and sized correctly'
    ]
  },
  {
    name: 'SkeletonCard',
    checklist: [
      '✓ 100% width on mobile',
      '✓ Proper padding (12-16px)',
      '✓ Grid responsive (auto-fit)',
      '✓ Gap consistent',
      '✓ Aspect ratio correct',
      '✓ Animation smooth'
    ]
  },
  {
    name: 'SkeletonLoader',
    checklist: [
      '✓ 100% width container',
      '✓ Proper line height (1.5em)',
      '✓ Margin between lines',
      '✓ Fills viewport height',
      '✓ Animation smooth',
      '✓ No overflow'
    ]
  },
  {
    name: 'Form Inputs',
    checklist: [
      '✓ Min height 44px (mobile touch)',
      '✓ Padding 12-16px',
      '✓ Font size >= 16px',
      '✓ Full width on mobile',
      '✓ Proper focus states',
      '✓ Error message clearly visible'
    ]
  },
  {
    name: 'Action Buttons',
    checklist: [
      '✓ Min height 44px (mobile touch)',
      '✓ Min width 44px',
      '✓ Proper spacing',
      '✓ Icons sized correctly',
      '✓ Touch feedback visible',
      '✓ Not covered by soft keyboard'
    ]
  },
  {
    name: 'Admin Pages',
    checklist: [
      '✓ Sidebar collapsible on <768px',
      '✓ Tables horizontal scrollable',
      '✓ Modals full-width on mobile',
      '✓ Dropdowns not cut off',
      '✓ Action buttons accessible',
      '✓ Search bar full width'
    ]
  },
  {
    name: 'Quiz Page',
    checklist: [
      '✓ Questions readable',
      '✓ Options full-width',
      '✓ Option buttons >= 44px height',
      '✓ Score display visible',
      '✓ Submit button accessible',
      '✓ Timer visible',
      '✓ Progress bar visible',
      '✓ No horizontal scroll'
    ]
  },
  {
    name: 'Profile Page',
    checklist: [
      '✓ Stats cards stacked on mobile',
      '✓ Form fields full-width',
      '✓ Edit button accessible',
      '✓ Change password button accessible',
      '✓ Loading skeleton visible',
      '✓ Error message visible'
    ]
  }
];

async function runTests() {
  console.log('\n╔═════════════════════════════════════════════════════════════╗');
  console.log('║         MOBILE RESPONSIVENESS TESTING CHECKLIST              ║');
  console.log('║                    March 11, 2026                            ║');
  console.log('╚═════════════════════════════════════════════════════════════╝\n');

  // Test backend health first
  console.log('📱 VIEWPORT SIZES TO TEST:\n');
  viewportSizes.forEach(vp => {
    console.log(`   • ${vp.name.padEnd(20)} → ${vp.width}x${vp.height}px`);
  });

  console.log('\n─────────────────────────────────────────────────────────────\n');

  // Test API endpoints
  console.log('✅ BACKEND API READY:\n');
  try {
    const healthCheck = await makeRequest('GET', '/health');
    console.log(`   ✓ API Status: ${healthCheck.status === 200 ? 'Running' : 'Failed'}`);
  } catch (err) {
    console.log(`   ✗ API Down: ${err.message}`);
  }

  // Component responsiveness checklist
  console.log('\n─────────────────────────────────────────────────────────────\n');
  console.log('📋 RESPONSIVE COMPONENTS CHECKLIST:\n');

  componentsToTest.forEach((component, idx) => {
    console.log(`\n${idx + 1}. ${component.name}`);
    console.log('   ' + '─'.repeat(50));
    component.checklist.forEach(item => {
      console.log(`   ${item}`);
    });
  });

  // Responsive design patterns
  console.log('\n─────────────────────────────────────────────────────────────\n');
  console.log('🎨 RESPONSIVE DESIGN PATTERNS:\n');

  const patterns = [
    {
      pattern: 'Mobile-First Approach',
      details: 'Default styles for 375px, then scale up'
    },
    {
      pattern: 'CSS Grid Auto-fit',
      details: 'grid-template-columns: repeat(auto-fit, minmax(min-width, 1fr))'
    },
    {
      pattern: 'Flexible Typography',
      details: 'font-size: clamp(14px, 4vw, 32px)'
    },
    {
      pattern: 'Touch Target Sizes',
      details: 'Min 44x44px for buttons, 48px for inputs'
    },
    {
      pattern: 'Viewport Meta Tag',
      details: '<meta name="viewport" content="width=device-width, initial-scale=1">'
    },
    {
      pattern: 'Safe Area Insets',
      details: 'padding: env(safe-area-inset-*) for notch handling'
    }
  ];

  patterns.forEach((p, idx) => {
    console.log(`   ${idx + 1}. ${p.pattern}`);
    console.log(`      → ${p.details}`);
  });

  // Mobile testing steps
  console.log('\n─────────────────────────────────────────────────────────────\n');
  console.log('🧪 MANUAL MOBILE TESTING STEPS:\n');

  const steps = [
    {
      step: 'Open Browser DevTools',
      action: 'Press F12 or Ctrl+Shift+I → Click Device Toolbar'
    },
    {
      step: 'Test Mobile Viewport (375px)',
      action: 'Login → Quiz → Check SkeletonLoader → Answer questions'
    },
    {
      step: 'Test Tablet Viewport (768px)',
      action: 'Admin Dashboard → User/Level Management → Test CRUD'
    },
    {
      step: 'Test Landscape (667px height)',
      action: 'Rotate phone → Verify layout adapts'
    },
    {
      step: 'Test Toast Visibility',
      action: 'All pages → Trigger toast → Verify visible & dismissible'
    },
    {
      step: 'Test Form Inputs',
      action: 'Mobile keyboard → Input doesn\'t hide submit button'
    },
    {
      step: 'Test Modals',
      action: 'Click delete/create → Modal full-width on mobile'
    },
    {
      step: 'Test Touch Targets',
      action: 'Buttons/inputs should be easy to tap (44px+)'
    }
  ];

  steps.forEach((s, idx) => {
    console.log(`   ${idx + 1}. ${s.step.padEnd(30)}`);
    console.log(`      → ${s.action}`);
  });

  // URLs to test
  console.log('\n─────────────────────────────────────────────────────────────\n');
  console.log('🔗 PAGES TO TEST ON MOBILE:\n');

  const pages = [
    { path: '/', title: 'Landing Page' },
    { path: '/login', title: 'Login Page' },
    { path: '/register', title: 'Register Page' },
    { path: '/levels', title: 'Level Selection (Quiz)' },
    { path: '/quiz/1', title: 'Quiz Page' },
    { path: '/profile', title: 'Student Profile' },
    { path: '/admin', title: 'Admin Dashboard' },
    { path: '/admin/users', title: 'User Management' },
    { path: '/admin/levels', title: 'Level Management' }
  ];

  pages.forEach((p, idx) => {
    console.log(`   ${idx + 1}. ${p.title.padEnd(25)} → http://localhost:5173${p.path}`);
  });

  // Responsive CSS media queries used
  console.log('\n─────────────────────────────────────────────────────────────\n');
  console.log('📐 MEDIA QUERY BREAKPOINTS:\n');

  const breakpoints = [
    { size: '320px', device: 'Small mobile (old phones)' },
    { size: '375px', device: 'iPhone SE, iPhone 12 mini' },
    { size: '425px', device: 'iPhone 14, Samsung Galaxy S23' },
    { size: '768px', device: 'iPad Mini, tablets' },
    { size: '1024px', device: 'iPad Pro, small laptop' },
    { size: '1920px', device: 'Desktop, 1080p monitor' }
  ];

  breakpoints.forEach(bp => {
    console.log(`   @media (max-width: ${bp.size.padEnd(7)}) → ${bp.device}`);
  });

  // Common mobile issues to watch for
  console.log('\n─────────────────────────────────────────────────────────────\n');
  console.log('⚠️  COMMON MOBILE ISSUES TO WATCH:\n');

  const issues = [
    '✗ Text too small (<16px makes keyboard pop)',
    '✗ Buttons too small (<44px hard to tap)',
    '✗ Images too large (massive on slow 4G)',
    '✗ Modals not full-width on small screens',
    '✗ Horizontal scroll (overflow-x)',
    '✗ Fixed elements covering content',
    '✗ Form inputs hidden by soft keyboard',
    '✗ Toast notifications cut off by notch',
    '✗ Table not scrollable (stuck content)',
    '✗ Sidebar not collapsible (wastes space)'
  ];

  issues.forEach((issue, idx) => {
    console.log(`   ${idx + 1}. ${issue}`);
  });

  // Results summary
  console.log('\n─────────────────────────────────────────────────────────────\n');
  console.log('✅ TESTING CHECKLIST READY!\n');
  console.log('   Next Steps:');
  console.log('   1. Open http://localhost:5173 in browser');
  console.log('   2. Press F12 to open DevTools');
  console.log('   3. Click "Toggle device toolbar" (or Ctrl+Shift+M)');
  console.log('   4. Test at: 375px, 768px, and landscape orientations');
  console.log('   5. Try all pages and interactions listed above');
  console.log('   6. Check for issues mentioned in ⚠️ section');
  console.log('   7. Report any layout/UX problems found\n');
}

runTests().catch(console.error);

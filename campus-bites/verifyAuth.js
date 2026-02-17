/**
 * AUTH SYSTEM VERIFICATION SCRIPT
 * 
 * Run this in your browser console after logging in
 * to verify your authentication data structure is correct
 */

console.log('🔍 AUTH SYSTEM VERIFICATION\n');

// Check if user exists in localStorage
const userString = localStorage.getItem('user');

if (!userString) {
  console.error('❌ No user found in localStorage');
  console.log('👉 Try logging in first');
} else {
  console.log('✅ User found in localStorage\n');
  
  const user = JSON.parse(userString);
  console.log('📦 Stored User Object:', user);
  console.log('\n🔎 Data Structure Check:\n');
  
  // Check if it has the correct structure
  if (user.success !== undefined) {
    console.log('⚠️  User object has backend response wrapper');
    console.log('   Found properties:', Object.keys(user));
    
    if (user.data) {
      console.log('\n✅ User data is nested in .data property');
      console.log('   User ID:', user.data._id || 'MISSING');
      console.log('   Name:', user.data.name || 'MISSING');
      console.log('   Email:', user.data.email || 'MISSING');
      console.log('   Role:', user.data.role || 'MISSING');
      console.log('   Token:', user.data.token ? '✅ Present' : '❌ MISSING');
      
      console.log('\n⚠️  ISSUE DETECTED:');
      console.log('   Your code accesses user.role but should use user.data.role');
      console.log('\n💡 FIX NEEDED in authService.js:');
      console.log('   Change: localStorage.setItem("user", JSON.stringify(response.data));');
      console.log('   To:     localStorage.setItem("user", JSON.stringify(response.data.data));');
    }
  } else {
    console.log('✅ User object has correct format (no wrapper)');
    console.log('   User ID:', user._id || 'MISSING');
    console.log('   Name:', user.name || 'MISSING');
    console.log('   Email:', user.email || 'MISSING');
    console.log('   Role:', user.role || 'MISSING');
    console.log('   Token:', user.token ? '✅ Present' : '❌ MISSING');
    
    if (user._id && user.role && user.token) {
      console.log('\n✅ All good! Auth system working correctly');
    } else {
      console.log('\n❌ Some required fields are missing');
    }
  }
  
  // Check JWT token structure
  if (user.token || user.data?.token) {
    const token = user.token || user.data.token;
    console.log('\n🎫 JWT Token Check:');
    console.log('   Length:', token.length, 'characters');
    console.log('   Format:', token.startsWith('eyJ') ? '✅ Valid JWT format' : '❌ Invalid format');
    
    // Try to decode JWT (without verification)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('   Decoded Payload:', payload);
      console.log('   User ID in token:', payload.id || 'MISSING');
      console.log('   Expires:', new Date(payload.exp * 1000).toLocaleString());
    } catch (e) {
      console.error('   ❌ Could not decode token');
    }
  } else {
    console.log('\n❌ No JWT token found');
  }
}

console.log('\n' + '='.repeat(60));

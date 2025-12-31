const testRegistration = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        firstName: 'Test',
        lastName: 'User',
        email: 'test' + Date.now() + '@example.com',
        phone: '1234567890',
        password: 'password123',
        role: 'applicant'
      })
    });
    const data = await response.json();
    if (response.ok) {
      console.log('✅ Registration successful:', data);
    } else {
      console.error('❌ Registration failed:', data);
    }
  } catch (error) {
    console.error('❌ Error connecting to server:', error.message);
  }
};

testRegistration();
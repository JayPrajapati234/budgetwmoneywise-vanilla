const Index = () => {
  window.location.href = '/login.html';
  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: '#0f172a', color: '#f1f5f9', fontFamily: 'Poppins, sans-serif' }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#6366f1' }}>💰 BudgetWise</h1>
        <p>Loading your Expense Tracker...</p>
      </div>
    </div>
  );
};

export default Index;

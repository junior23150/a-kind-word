console.log('App.tsx loading...');

const App = () => {
  console.log('App component rendering...');
  
  return (
    <div style={{ padding: '20px', fontSize: '24px', color: 'red' }}>
      <h1>TESTE - A aplicação está funcionando!</h1>
      <p>Se você vê esta mensagem, o React está funcionando.</p>
      <p>Rota atual: {window.location.pathname}</p>
    </div>
  );
};

console.log('App.tsx exporting...');
export default App;
import "./App.css";

function App() {
  return(
    <>
      <div className="header">
        <HeaderContent />
      </div>
      <div className="main">
        <Game />
      </div>
      <div className="footer">
        <FooterContent />
      </div>
    </>
  );
}

function Game() {
  return (
    <>
      <div className="play">
        <Bomb />
        <TextBox />
      </div>
      <div className="letters">
        <Letters />
      </div>
    </>
  )
}

function Bomb() {
  return(
    <div id="bomb"></div>
  );
}

function TextBox() {
  return (
    <div className="textbox">supplementary</div>
  );
}

function Letters() {
  const lowercaseLetters = Array.from({ length: 26 }, (_, index) => String.fromCharCode(97 + index));

  return (
    <>
      {lowercaseLetters.map((letter, index) => (
        <div className="letter" key={index}>{letter}</div>
      ))}
    </>
  );
}

function HeaderContent() {
  return (
    <Stats />
  );
}

function Stats() {
  return(
    <div className="stats">
      Score: 2342389
    </div>
  );
}

function FooterContent() {

}

export default App;
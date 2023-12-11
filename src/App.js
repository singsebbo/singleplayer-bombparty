import "./App.css";
import { useState, useEffect } from "react";

function App() {
  const [score, setScore] = useState(0);
  // -1 is no game running, 0 is game lose, anything greater is difficulty of game
  const [difficulty, setDifficulty] = useState(-1);
  const [lastScore, setLastScore] = useState('');
  const [usedWords, setUsedWords] = useState(new Set());

  return(
    <>
      <div className="header">
        <HeaderContent score={score}/>
      </div>
      <div className="main">
        <Game setScore={setScore} difficulty={difficulty} setDifficulty={setDifficulty} lastScore={lastScore} setLastScore={setLastScore} score={score} usedWords={usedWords} setUsedWords={setUsedWords}/>
      </div>
      <div className="footer">
        <FooterContent setDifficulty={setDifficulty}/>
      </div>
    </>
  );
}

function Game({setScore, difficulty, setDifficulty, lastScore, setLastScore, score, usedWords, setUsedWords}) {
  return (
    <>
      <div className="play">
        <Bomb difficulty={difficulty} setDifficulty={setDifficulty} setScore={setScore} lastScore={lastScore} setLastScore={setLastScore} score={score}/>
        <TextBox setScore={setScore} difficulty={difficulty} usedWords={usedWords} setUsedWords={setUsedWords}/>
      </div>
      <div className="letters">
        <Letters />
      </div>
    </>
  )
}

function Bomb({difficulty, setDifficulty, setScore, lastScore, setLastScore, score}) {
  const [timeLeft, setTimeLeft] = useState(-1);
  const [timerRotation, setTimerRotation] = useState(0);

  useEffect(() => {
    if (difficulty > 0) {
      setLastScore('');
      setTimeLeft(difficulty);
    }
  }, [difficulty]);

  useEffect(() => {
    if (timeLeft != -1) {
      const intervalId = setInterval(() => {
        if (timeLeft > 0) {
          setTimeLeft((prevTime) => prevTime - 0.1);
          let percentLeft = (timeLeft / difficulty) * 100;
          setTimerRotation(360 - (percentLeft / 100) * 360);
        } else {
          clearInterval(intervalId);
          setLastScore(score);
          setDifficulty(0);
          setTimerRotation(360);
          setScore(0);
          setTimeout(() => {
            setTimerRotation(0);
            setDifficulty(-1);
          }, 500)
        }
      }, 100);
  
      return () => clearInterval(intervalId);
    }
  }, [timeLeft]);

  useEffect(() => {
    if (score > 0) {
      setTimeLeft(difficulty);
    }
  }, [score]);

  return(
    <div id="bomb" style={{backgroundImage: `conic-gradient(#ff0000 ${timerRotation}deg, transparent ${timerRotation}deg 360deg)`}}>
      {lastScore}
    </div>
  );
}

function TextBox({setScore, difficulty, usedWords, setUsedWords}) {
  const [text, setText] = useState('');
  const [wrong, setWrong] = useState(false);

  function handleKeyDown(event) {
    if (event.key.length === 1 && event.key.match(/[a-zA-Z]/)) {
      // Add the alphabetical key to the text
      setText((prevText) => prevText + event.key.toLowerCase());
    } else if (event.key === 'Backspace') {
      // Delete the last character when Backspace is pressed
      setText((prevText) => prevText.slice(0, -1));
    } else if (event.key === "Enter") {
      // if word
      if (usedWords.has(text)) {
        
      } else {
        setUsedWords((prevWords) => new Set([...prevWords, text]));
        setText("");
        setScore((prevScore) => prevScore + 1);
      }
    }
  };

  useEffect(() => {
    if (difficulty > 0) {
      document.addEventListener('keydown', handleKeyDown);
    } else {
      document.removeEventListener('keydown', handleKeyDown);
      setText('');
    }

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [difficulty]);
  return (
    <div className="textbox" style={{color: `${wrong ? `#ff0000` : `#000000`}`}}>{text}</div>
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

function HeaderContent({score}) {
  return (
    <Stats score={score}/>
  );
}

function Stats({score}) {
  return(
    <div className="stats">
      Score: {score}
    </div>
  );
}

function FooterContent({setDifficulty}) {
  return (
    <>
      <div className="difficulty" onClick={() => setDifficulty(8)}>Easy</div>
      <div className="difficulty" onClick={() => setDifficulty(5)}>Medium</div>
      <div className="difficulty" onClick={() => setDifficulty(3)}>Hard</div>
    </>
  );
}

export default App;
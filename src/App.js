import "./App.css";
import axios from 'axios';
import { useState, useEffect, useRef } from "react";

function App() {
  const [score, setScore] = useState(0);
  // -1 is no game running, 0 is game lose, anything greater is difficulty of game
  const [difficulty, setDifficulty] = useState(-1);
  const [lastScore, setLastScore] = useState('');
  const usedWords = useRef(new Set());

  return(
    <>
      <div className="header">
        <HeaderContent score={score}/>
      </div>
      <div className="main">
        <Game setScore={setScore} difficulty={difficulty} setDifficulty={setDifficulty} lastScore={lastScore} setLastScore={setLastScore} score={score} usedWords={usedWords}/>
      </div>
      <div className="footer">
        <FooterContent setDifficulty={setDifficulty}/>
      </div>
    </>
  );
}

function Game({setScore, difficulty, setDifficulty, lastScore, setLastScore, score, usedWords}) {
  return (
    <>
      <div className="play">
        <Bomb difficulty={difficulty} setDifficulty={setDifficulty} setScore={setScore} lastScore={lastScore} setLastScore={setLastScore} score={score} usedWords={usedWords}/>
        <TextBox setScore={setScore} difficulty={difficulty} usedWords={usedWords}/>
      </div>
      <div className="letters">
        <Letters />
      </div>
    </>
  )
}

function Bomb({difficulty, setDifficulty, setScore, lastScore, setLastScore, score, usedWords}) {
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
            usedWords.current.clear();
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

function TextBox({setScore, difficulty, usedWords}) {
  const [text, setText] = useState("");

  const textRef = useRef("");
  const setTextRef = (data) => {
    textRef.current = data;
    setText(data);
  }

  const handleKeyDown = (event) => {
    if (event.key.length === 1 && event.key.match(/[a-zA-Z]/)) {
      // Add the alphabetical key to the text
      setTextRef(textRef.current + event.key.toLowerCase());
    } else if (event.key === 'Backspace') {
      // Delete the last character when Backspace is pressed
      setTextRef(textRef.current.slice(0, -1));
    } else if (event.key === "Enter") {
      // if word typed contains the current substring
      
      // if word is a word and it has not been said yet
      if (!usedWords.current.has(textRef.current)) {
        axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${textRef.current}`)
          .then(response => {
            usedWords.current.add(textRef.current);
            setTextRef("");
            setScore((prevScore) => prevScore + 1);
          })
          .catch(error => {
            console.error("Not a word");
          });
      }
    }
  } 

  useEffect(() => {
    if (difficulty > 0) {
      document.addEventListener('keydown', handleKeyDown);
    } else {
      document.removeEventListener('keydown', handleKeyDown);
      setText("");
    }

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [difficulty]);
  return (
    <div className="textbox">{text}</div>
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
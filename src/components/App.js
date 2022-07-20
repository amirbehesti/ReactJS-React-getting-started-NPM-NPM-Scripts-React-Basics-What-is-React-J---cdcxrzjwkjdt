import React, { Component, useEffect, useState } from "react";
import '../styles/App.css';

const App = () => {
  const [currentWorkTime, setCurrentWorkTime] = useState(25 * 60);
  const [currentBreakTime, setCurrentBreakTime] = useState(5 * 60);
  const [renderTime, setRenderTime] = useState("25:00");
  const [currentTimer, setCurrentTimer] = useState("work");
  const [isStartButtonDisabled, setIsStartButtonDisabled] = useState(false);
  const [isStopButtonDisabled, setIsStopButtonDisabled] = useState(true);
  const [isResetButtonDisabled, setIsResetButtonDisabled] = useState(true);
  const [isSetButtonDisabled, setIsSetButtonDisabled] = useState(false);
  const [isWorkInputDisabled, setIsWorkInputDisabled] = useState(false);
  const [isBreakInputDisabled, setIsBreakInputDisabled] = useState(false);
  const [defaultWorkTime, setDefaultWorkTime] = useState(25);
  const [defaultBreakTime, setDefaultBreakTime] = useState(5);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [intervalId, setIntervalId] = useState();
  const [reset, setReset] = useState(false);
  const [formData, setFormData] = useState({
    workDuration: "",
    breakDuration: "",
  });

  const convertHMS = (value) => {
    const sec = parseInt(value);
    let hours = Math.floor(sec / 3600); // get hours
    let minutes = Math.floor((sec - (hours * 3600)) / 60); // get minutes
    let seconds = sec - (hours * 3600) - (minutes * 60); //  get seconds
    if (hours < 10) { hours = "0" + hours; }
    if (minutes < 10) { minutes = "0" + minutes; }
    if (seconds < 10) { seconds = "0" + seconds; }
    setRenderTime(minutes + ":" + seconds); // Return is MM : SS
  }

  const convertToSec = (minute) => {
    return parseInt(minute) * 60;
  }

  // Initial state of timer
  const setInitialState = () => {
    setIsStartButtonDisabled(false);
    setIsStopButtonDisabled(true);
    setIsResetButtonDisabled(true);
    setIsWorkInputDisabled(false);
    setIsBreakInputDisabled(false);
    setIsSetButtonDisabled(false);
    setRenderTime("25:00");
    setCurrentTimer('work');
    setCurrentWorkTime(convertToSec(25));
    setDefaultWorkTime(25);
    setDefaultBreakTime(5);
  }

  // Timer started state
  const setTimerStartedState = () => {
    setIsWorkInputDisabled(true);
    setIsBreakInputDisabled(true);
    setIsStartButtonDisabled(true);
    setIsResetButtonDisabled(false);
    setIsStopButtonDisabled(false);
    setIsSetButtonDisabled(true);
  }

  // Timer stopped state
  const setTimerStoppedState = () => {
    setIsWorkInputDisabled(false);
    setIsBreakInputDisabled(false);
    setIsStartButtonDisabled(false);
    setIsResetButtonDisabled(false);
    setIsStopButtonDisabled(true);
    setIsSetButtonDisabled(false);
  }

  // Handle submit
  const handleSubmit = (e) => {
    setFormSubmitted(false);
    e.preventDefault();
    const data = new FormData(e.target);
    const values = Object.fromEntries(data.entries());
    if (
      values.workDuration == 0
      && values.breakDuration == 0
    ) {
      setDefaultWorkTime(25);
      setDefaultBreakTime(5);
      setInitialState();
      setCurrentWorkTime(convertToSec(defaultWorkTime));
      return;
    }
    setFormData({ ...values });
    setFormSubmitted(true);
  }

  // Set timer value
  const setTimer = () => {
    setReset(true);
    setCurrentWorkTime(convertToSec(formData.workDuration));
    setCurrentBreakTime(convertToSec(formData.breakDuration));
    setCurrentTimer('work');
  }

  // Get current timer
  const getCurrentTimer = () => {
    if (currentTimer === 'work') return currentWorkTime;
    else return currentBreakTime;
  }

  // Start work timer
  const startWorkTimer = () => {
    setTimerStartedState();
    setReset(false);
    if (!formSubmitted) setFormSubmitted(true);
    if (!currentWorkTime) setCurrentWorkTime(convertToSec(defaultWorkTime));
    if (intervalId) clearInterval(intervalId);
    const newInterval = setInterval(() => {
      setCurrentWorkTime(prevData => prevData - 1);
    }, 1000);
    setIntervalId(newInterval);
  }

  // End work timer
  const endWorkTimer = () => {
    if (intervalId) clearInterval(intervalId);
    setCurrentWorkTime(convertToSec(formData.workDuration));
    setCurrentTimer('break');
    alert("work duration over");
  }

  // Start break timer
  const startBreakTimer = () => {
    setTimerStartedState();
    setReset(false);
    if (!formSubmitted) setFormSubmitted(true);
    if (intervalId) clearInterval(intervalId);
    const newInterval = setInterval(() => {
      setCurrentBreakTime(prevData => prevData - 1);
    }, 1000);
    setIntervalId(newInterval);
  }

  // End break timer
  const endBreakTimer = () => {
    if (intervalId) clearInterval(intervalId);
    setCurrentBreakTime(convertToSec(formData.breakDuration));
    setCurrentTimer('work');
    alert("break duration over");
  }

  // Stop current timer
  const stopTimer = () => {
    setTimerStoppedState();
    if (intervalId) clearInterval(intervalId);
  }

  // Reset current timer
  const resetCounter = () => {
    setReset(true);
    if (intervalId) clearInterval(intervalId);
    setInitialState();
  }

  useEffect(() => {
    if (formSubmitted) convertHMS(getCurrentTimer());
    if (
      currentWorkTime === 0
      && formSubmitted
    ) endWorkTimer();

    if (
      currentBreakTime === 0
      && formSubmitted
    ) endBreakTimer();
  }, [currentWorkTime, currentBreakTime]);

  useEffect(() => {
    if (
      formSubmitted
      && currentTimer === 'work'
      && !reset
    ) startWorkTimer();

    if (
      formSubmitted
      && currentTimer === 'break'
      && !reset
    ) startBreakTimer();
  }, [currentTimer]);

  useEffect(() => {
    if (defaultWorkTime < 0) setDefaultWorkTime("");
    if (defaultBreakTime < 0) setDefaultBreakTime("");
  }, [defaultWorkTime, defaultBreakTime]);

  useEffect(() => {
    if (
      formData.workDuration.length
      && formData.breakDuration.length
    ) setTimer();
  }, [formData]);

  return (
    <div id="main">
      <div className="clock">
        <h1 className="timer">{renderTime}</h1>
        <h3>{currentTimer === 'work' ? 'Work' : 'Break'}-Time</h3>
      </div>
      <div className="control">
        <button
          className="start-btn"
          onClick={currentTimer === 'work' ? startWorkTimer : startBreakTimer}
          data-testid='start-btn'
          disabled={isStartButtonDisabled}
        >
          Start
        </button>

        <button
          className="stop-btn"
          onClick={stopTimer}
          data-testid='stop-btn'
          disabled={isStopButtonDisabled}
        >
          Stop
        </button>

        <button
          className="reset-btn"
          onClick={resetCounter}
          data-testid='reset-btn'
          disabled={isResetButtonDisabled}
        >
          Reset
        </button>
      </div>
      <br />
      <div className="parameters">
        <form onSubmit={handleSubmit}>
          <input
            disabled={isWorkInputDisabled}
            name="workDuration"
            data-testid="work-duration"
            placeholder="work duration"
            required type="Number"
            value={defaultWorkTime}
            onChange={e => {
              setDefaultWorkTime(+e.target.value);
            }}
          />
          <input
            disabled={isBreakInputDisabled}
            name="breakDuration"
            data-testid="break-duration"
            placeholder="break duration"
            required type="Number"
            value={defaultBreakTime}
            onChange={e => {
              setDefaultBreakTime(+e.target.value);
            }}
          />
          <button
            className="set-btn"
            disabled={isSetButtonDisabled}
            data-testid="set-btn"
            type="submit">
            set
          </button>
        </form>
      </div>
    </div>
  )
}


export default App;
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import NumberPadItem from "./NumberPadItem";
const NumberPad = ({ handleNumberPadClick }) => {
  return (
    <>
      <div className="keypad">
        <div className="row">
          <NumberPadItem
            handleNumberPadClick={handleNumberPadClick}
            numKey="1"
          />
          <NumberPadItem
            handleNumberPadClick={handleNumberPadClick}
            numKey="2"
          />
          <NumberPadItem
            handleNumberPadClick={handleNumberPadClick}
            numKey="3"
          />
        </div>
        <div className="row">
          <NumberPadItem
            handleNumberPadClick={handleNumberPadClick}
            numKey="4"
          />
          <NumberPadItem
            handleNumberPadClick={handleNumberPadClick}
            numKey="5"
          />
          <NumberPadItem
            handleNumberPadClick={handleNumberPadClick}
            numKey="6"
          />
        </div>
        <div className="row">
          <NumberPadItem
            handleNumberPadClick={handleNumberPadClick}
            numKey="7"
          />
          <NumberPadItem
            handleNumberPadClick={handleNumberPadClick}
            numKey="8"
          />
          <NumberPadItem
            handleNumberPadClick={handleNumberPadClick}
            numKey="9"
          />
        </div>
        <div className="row">
          <NumberPadItem
            handleNumberPadClick={handleNumberPadClick}
            numKey="#"
          />
          <NumberPadItem
            handleNumberPadClick={handleNumberPadClick}
            numKey="0"
          />

          <button onClick={(e)=>handleNumberPadClick(e,"x")} className="arrowDelete">
            <FontAwesomeIcon
              icon="fa-solid fa-arrow-left"
              className="arrowLeftIcon"
            />
          </button>
        </div>
      </div>
    </>
  );
};

export default NumberPad;

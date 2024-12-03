import React from 'react'

function NumberPadItem({handleNumberPadClick,numKey}) {
  return (
    <button onClick={(e)=>handleNumberPadClick(e,numKey)}>{numKey}</button>
  )
}

export default NumberPadItem
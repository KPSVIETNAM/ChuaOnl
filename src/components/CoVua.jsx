import React from 'react';
import BoardGameRoom from './BoardGameRoom';

export default function CoVua(props) {
  return <BoardGameRoom game="chess" {...props} />;
}
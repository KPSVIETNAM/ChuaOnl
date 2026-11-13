import React from 'react';
import BoardGameRoom from './BoardGameRoom';

export default function CoVay(props) {
  return <BoardGameRoom game="go" {...props} />;
}
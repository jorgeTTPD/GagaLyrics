import React from 'react';
import {Composition} from 'remotion';
import {MillionReasons} from './MillionReasons';

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="MillionReasons"
      component={MillionReasons}
      durationInFrames={825}
      fps={30}
      width={2528}
      height={1696}
    />
  );
};

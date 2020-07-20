import { action } from '@storybook/addon-actions';
import { storiesOf } from '@storybook/react';
import React from 'react';
import { host } from 'storybook-host';

import DeclarationQuestion from '../DeclarationQuestion';

const defaultProps = {
  name: 'hasWorked',
  label: 'Avez-vous travaillé ?',
  onAnswer: action('onAnswer'),
};

storiesOf('DeclarationQuestion', module)
  .addDecorator(
    host({
      align: 'center',
      width: 600,
    }),
  )
  .add('default', () => <DeclarationQuestion {...defaultProps} value={null} />)
  .add('vertical layout', () => (
    <DeclarationQuestion {...defaultProps} value={null} verticalLayout />
  ))
  .add('yes', () => <DeclarationQuestion {...defaultProps} value />)
  .add('no', () => <DeclarationQuestion {...defaultProps} value={false} />)
  .add('with children on yes', () => (
    <DeclarationQuestion {...defaultProps} value>
      <div>Sub question</div>
    </DeclarationQuestion>
  ))
  .add('with children on no', () => (
    <DeclarationQuestion {...defaultProps} value={false} withChildrenOnNo>
      <div>Sub question</div>
    </DeclarationQuestion>
  ));

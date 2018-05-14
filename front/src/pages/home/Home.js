import React, { Component } from 'react';
import PropTypes from 'prop-types'
import PEConnectLink from '../../components/PEConnect/PEConnectLink';

export class Home extends Component {
  static propTypes = {
    user: PropTypes.shape({
      firstName: PropTypes.string,
      lastName: PropTypes.string,
      email: PropTypes.string
    })
  }

  render() {
    const { user } = this.props

    return (
      <div className="Home">
        <header>
          {user ?
            `${user.firstName} ${user.lastName}` :
            <PEConnectLink />
          }
        </header>
        <main>
          <h1>Il n'a jamais été aussi simple de faire son actualisation</h1>
          {!user ? 'Connectez-vous pour commencer' : 'Commencer'}
        </main>
      </div>
    )
  }
};

export default Home;

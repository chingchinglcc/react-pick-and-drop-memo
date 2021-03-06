import React, { Component } from 'react';
import firebase from 'firebase';
import axios from 'axios';

import Grid from '@material-ui/core/Grid';

import app from '../../base';
import MemoGrid from '../MemosGrid/MemoGrid';
import UserProfile from '../UserProfile/UserProfile';

class User extends Component {
  constructor(props) {
    super(props);
    this.state = {
      memos: {},
      didAuth: false,
      userId: null,
      userName: '',
      userIcon: null,
      updated: false,
      favourtied: false
    };
    this.deleteMemo = this.deleteMemo.bind(this);
  }

  componentDidMount() {
    firebase.auth().onAuthStateChanged(user => {
      let displayName;

      if (user) {
        if (!user.displayName) {
          displayName = user.email;
        } else {
          displayName = user.displayName;
        }

        this.setState({
          didAuth: true,
          userId: user.uid,
          userName: displayName,
          userIcon: user.photoURL
        });

        this.loadUserMemo();
      }
    });
  }

  authenticate = provider => {
    const authProvider = new firebase.auth[`${provider}AuthProvider`]();
    app.auth().signInWithPopup(authProvider);
  };

  loadUserMemo() {
    axios.get('/memos.json').then(response => {
      let arr = { ...response.data };
      this.setState({
        memos: arr
      });
    });
  }

  deleteMemo(key) {
    axios.delete(`/memos/${key}.json`).then(res => {
      console.log(res);
      this.setState({ updated: true });
      if (this.state.updated) {
        this.loadUserMemo();
      }
    });
  }

  render() {
    const isLoggedIn = this.state.didAuth;
    let logined;

    if (isLoggedIn) {
      const { didAuth, userName, userIcon } = this.state;
      logined = (
        <UserProfile userData={didAuth} name={userName} userIcon={userIcon} />
      );
    } else {
      logined = null;
    }

    let userData = <p>Failed to load User Data</p>;

    if (this.state.memos) {
      userData = Object.keys(this.state.memos).map(memo => {
        let key = memo;

        let userArr = [...Array(this.state.memos[memo])];

        return userArr.map(memo => {
          if (memo.uid === this.state.userId) {
            return (
              <MemoGrid
                notes={userArr}
                url={this.props.match.path}
                key={new Date().valueOf()}
                datakey={key}
                userId={this.state.userId}
                onUserPage={true}
                memos={userArr}
                deleteMemo={e => this.deleteMemo(key)}
                {...this.props}
              />
            );
          }
        });
      });
    }

    return (
      <>
        <Grid container spacing={16}>
          {logined}
          <Grid container item xs={12} spacing={24}>
            {userData}
          </Grid>
        </Grid>
      </>
    );
  }
}

export default User;

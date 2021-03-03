import React, {Fragment, useEffect} from 'react'
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom'
import {Provider} from 'react-redux'

import './App.css'
import store from "./store";
import {loadUser} from './actions/auth'

import Register from './components/auth/Register'
import Login from './components/auth/Login'
import Navbar from './components/layout/Navbar'
import Landing from './components/layout/Landing'
import Alert from './components/layout/Alert'
import Dashboard from './components/dashboard/Dashboard'
import CreateProfile from './components/profile/CreateProfile'
import PrivateRoute from './components/routing/PrivateRoute'
import setAuthToken from "./utils/setAuthToken";


if (localStorage.token) {
    setAuthToken(localStorage.token)
}

const App = () => {
    useEffect(() => {
        store.dispatch(loadUser())
    }, [])

    return (
        <Provider store={store}>
            <Router>
                <Fragment>
                    <Navbar/>
                    <Route exact path='/' component={Landing}/>
                    <section className="container">
                        <Alert/>
                        <Switch>
                            <Route exact path="/login" component={Login}/>
                            <Route exact path="/register" component={Register}/>
                            <PrivateRoute exact path="/dashboard" component={Dashboard}/>
                            <PrivateRoute exact path="/create-profile" component={CreateProfile}/>
                        </Switch>
                    </section>
                </Fragment>
            </Router>
        </Provider>
    )
}

export default App;

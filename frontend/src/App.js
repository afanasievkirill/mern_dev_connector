import React, {Fragment, useEffect} from 'react'
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom'
import {Provider} from 'react-redux'

import './App.css'
import store from "./store";
import Navbar from './components/layout/Navbar'
import Landing from './components/layout/Landing'
import Alert from './components/layout/Alert'
import Login from './components/auth/Login'
import Register from './components/auth/Register'
import setAuthToken from "./utils/setAuthToken";
import {loadUser} from './actions/auth'

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
                        </Switch>
                    </section>
                </Fragment>
            </Router>
        </Provider>
    )
}

export default App;

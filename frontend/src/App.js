import React, {Fragment} from 'react'
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom'
import {Provider} from 'react-redux'

import './App.css'
import store from "./store";
import Navbar from './components/layout/Navbar'
import Landing from './components/layout/Landing'
import Login from './auth/Login'
import Register from './auth/Register'


const App = () => (
    <Provider store={store}>
        <Router>
            <Fragment>
                <Navbar/>
                <Route exact path='/' component={Landing}/>
                <section className="container">
                    <Switch>
                        <Route exact path="/login" component={Login}/>
                        <Route exact path="/register" component={Register}/>
                    </Switch>
                </section>
            </Fragment>
        </Router>
    </Provider>
)

export default App;

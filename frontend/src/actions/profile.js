import axios from 'axios'

import {setAlert} from './alert';
import {
    GET_PROFILE,
    UPDATE_PROFILE,
    PROFILE_ERROR,
    CLEAR_PROFILE,
    ACCOUNT_DELETED,
} from './types'

export const getCurrentProfile = () => async dispatch => {
    try {
        const res = await axios.get('http://docker_example.local/api/profile/me')
        dispatch({
            type: GET_PROFILE,
            payload: res.data
        })
    } catch (err) {
        dispatch({
            type: PROFILE_ERROR,
            payload: {msg: err.response.statusText, status: err.response.status}
        })
    }
}

export const createProfile = (formData, history, edit = false) => async (
    dispatch
) => {
    try {
        const res = await axios.post('http://docker_example.local/api/profile', formData);
        dispatch({
            type: GET_PROFILE,
            payload: res.data
        })
        dispatch(setAlert(edit ? 'Profile Updated.' : 'Profile Created.', 'success'))
        if (!edit) {
            history.push('/dashboard')
        }
    } catch (err) {
        const errors = err.response.data.errors
        if (errors) {
            errors.forEach((error) => dispatch(setAlert(error.msg, 'danger')));
        }
        dispatch({
            type: PROFILE_ERROR,
            payload: {msg: err.response.statusText, status: err.response.status}
        })
    }
}

export const addExperience = (formData, history) => async dispatch => {
    try {
        const res = await axios.put('http://docker_example.local/api/profile/experience', formData);
        dispatch({
            type: UPDATE_PROFILE,
            payload: res.data
        })
        dispatch(setAlert('Experience Added.', 'success'))
        history.push('/dashboard')
    } catch (err) {
        const errors = err.response.data.errors
        if (errors) {
            errors.forEach((error) => dispatch(setAlert(error.msg, 'danger')));
        }
        dispatch({
            type: PROFILE_ERROR,
            payload: {msg: err.response.statusText, status: err.response.status}
        })
    }
}

export const addEducation = (formData, history) => async dispatch => {
    try {
        const res = await axios.put('http://docker_example.local/api/profile/education', formData);
        dispatch({
            type: UPDATE_PROFILE,
            payload: res.data
        })
        dispatch(setAlert('Education Added.', 'success'))
        history.push('/dashboard')
    } catch (err) {
        const errors = err.response.data.errors
        if (errors) {
            errors.forEach((error) => dispatch(setAlert(error.msg, 'danger')));
        }
        dispatch({
            type: PROFILE_ERROR,
            payload: {msg: err.response.statusText, status: err.response.status}
        })
    }
}

export const deleteExperience = id => async dispatch => {
    try {
        const res = await axios.delete(`http://docker_example.local/api/profile/experience/${id}`)
        dispatch({
            type: UPDATE_PROFILE,
            payload: res.data
        })
        dispatch(setAlert('Experience Removed.', 'success'))
    } catch (err) {
        dispatch({
            type: PROFILE_ERROR,
            payload: {msg: err.response.statusText, status: err.response.status}
        })
    }
}

export const deleteEducation = id => async dispatch => {
    try {
        const res = await axios.delete(`http://docker_example.local/api/profile/education/${id}`)
        dispatch({
            type: UPDATE_PROFILE,
            payload: res.data
        })
        dispatch(setAlert('Education Removed.', 'success'))
    } catch (err) {
        dispatch({
            type: PROFILE_ERROR,
            payload: {msg: err.response.statusText, status: err.response.status}
        })
    }
}

export const deleteAccount = id => async dispatch => {
    if (window.confirm('Are you sure? This can NOT be undone.')) {
        try {
            const res = await axios.delete(`http://docker_example.local/api/profile`)
            dispatch({
                type: CLEAR_PROFILE
            })
            dispatch({
                type: ACCOUNT_DELETED
            })
            dispatch(setAlert('Your account has ben deleted.'))
        } catch (err) {
            dispatch({
                type: PROFILE_ERROR,
                payload: {msg: err.response.statusText, status: err.response.status}
            })
        }
    }

}
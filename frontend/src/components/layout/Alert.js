import React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'

// TODO alert-undefined problem
const Alert = ({alerts}) =>
    alerts !== null && alerts.length > 1 && alerts.map(alert => (
        <div key={alert.id} className={`alert alert-${alert.alertType}`}>
            {alert.msg}
        </div>
    ))

Alert.propTypes = {
    alerts: PropTypes.array.isRequired
}

const mapStateToProps = state => ({
    alerts: state.alert
})

export default connect(mapStateToProps)(Alert)
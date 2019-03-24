import React, { Component } from 'react';
import { connect } from 'react-redux';
import { get_temps } from '../actions/index'
class Test extends Component {
    constructor(props) {
        super(props);
        // this.state = {eventInvites
        //   initialValues: { ...this.props.initialValues },
        // };
        this.props.get_temps(33143);
    }
    render() {
        const Trow = (props) =>
            <div><span>{props.obj.date} | {props.obj.min} | {props.obj.max} </span></div>

        if (this.props.current) {
            let d = new Date()
            d.setTime(this.props.current.time * 1000)
            return (
                <div style={{backgroundColor: "#F6BB42"}}>
                    <div>
                        <h2>currently {this.props.current.temperature} degrees, high {this.props.high} low {this.props.low} </h2>
                        <h2>{d.toTimeString()}</h2>
                    </div>
                    {this.props.past.map((object, i) => {
                        return <Trow obj={object} key={i} />;
                    })}
                </div>
            )
        }
        else return (<div>Waiting</div>)
    }
}
const mapStateToProps = (state) => ({
    high : state.temps.max,
    low: state.temps.min,
    current: state.temps ? (state.temps.currently  || null) : null,
    past: state.temps ? (state.temps.ra || null) : null
});
const mapDispatchToProps = dispatch => ({
    get_temps: zip => dispatch(get_temps(zip)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Test);
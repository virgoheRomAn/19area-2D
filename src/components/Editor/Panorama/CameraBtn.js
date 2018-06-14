import './camerabtn';

export default class CameraBtn extends Component{
    render(){
        return (
            <div>
                <button onClick={this.props.onClick} style = {this.props.style} className="b_btn">{this.props.value}</button>
            </div>
        )
    }
}
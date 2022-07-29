import React, { Component } from 'react';
import './App.css';
import Pusher from 'pusher-js';

const API_URL = 'https://fails-server-2022.herokuapp.com/api/';

const PUSHER_APP_KEY = 'b224b8baf6fa437d7348';
const PUSHER_APP_CLUSTER = 'us2';


class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tasks: [],
      task: '',
      falla: null
    };
    this.updateText = this.updateText.bind(this);
    this.postTask = this.postTask.bind(this);
    this.deleteTask = this.deleteTask.bind(this);
    this.addTask = this.addTask.bind(this);
    this.removeTask = this.removeTask.bind(this);
    this.obtieneFallas = this.obtieneFallas.bind(this);
    this.obtieneFallas();    
    this.creaNotificacion = this.creaNotificacion.bind(this);
    this.obtieneUltimaFalla = this.obtieneUltimaFalla.bind(this);
  }

  async obtieneUltimaFalla() {
    const response = await fetch(API_URL + "ultimafalla");
    const falla = await response.json();
    this.setState({falla : falla});
  }

  creaNotificacion() {
    const noti = Notification.requestPermission().then(function(result) {
      console.log(result);
    });
    var img = '../logo_noti.png';
    let textoFalla = "";
    let text;
    let notification;      
    if (this.state.falla.planta === "1") {
      textoFalla = "Plant failure: Acambaro, Machine: " + this.state.falla.maquina + ", Date: " + this.state.falla.fecha;
      text = textoFalla;
      notification = new Notification('Fault Control System', { body: text, icon: img });      
      notification = null;
    }
    if (this.state.falla.planta === "2") {
      textoFalla = "Plant failure: Celaya, Machine: " + this.state.falla.maquina + ", Date: " + this.state.falla.fecha;
      text = textoFalla;
      notification = new Notification('Fault Control System', { body: text, icon: img });      
      notification = null;
    }

    console.log(notification);
    console.log(noti);
    this.obtieneFallas();

    this.setState({falla : null});
  }
  
  updateText(e) {
    this.setState({ task: e.target.value });
  }

  postTask(e) {
    e.preventDefault();
    if (!this.state.task.length) {
      return;
    }
    const newTask = {
      task: this.state.task
    };
    fetch(API_URL + 'new', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newTask)
    }).then(console.log);
  }
    
  deleteTask(id) {
    fetch(API_URL + id, {
      method: 'delete'
    }).then(console.log);
  }

  addTask(newTask) {
    this.setState(prevState => ({
      tasks: prevState.tasks.concat(newTask),
      task: ''
    }));
  }
    
  removeTask(id) {
    this.setState(prevState => ({
      tasks: prevState.tasks.filter(el => el.id !== id)
    }));
  }

  async obtieneFallas() {
    const response = await fetch(API_URL + "fallas");
    const fallas = await response.json();
    this.setState({tasks : fallas}) 
  }  

  componentDidMount() {
    this.obtieneUltimaFalla();

    this.pusher = new Pusher(PUSHER_APP_KEY, {
	  cluster: PUSHER_APP_CLUSTER,
      encrypted: true,
    });
    this.channel = this.pusher.subscribe('en-vivo-mongo');
	
    this.channel.bind('inserted', this.creaNotificacion);
    this.channel.bind('deleted', this.obtieneFallas);
  }
    
  render() {
    const tasksAcambaro = this.state.tasks.filter((item, i) => item.planta === "1");
    const tasks_acambaro = tasksAcambaro.map((item, i) =>
      <TaskAcambaro key={i} task={item} onTaskClick={this.deleteTask} />
    );

    const tasksCelaya = this.state.tasks.filter((item, i) => item.planta === "2");
    const tasks_celaya = tasksCelaya.map((item, i) =>
      <TaskCelaya key={i} task={item} onTaskClick={this.deleteTask} />
    );

    return (
      <div className="container">
        <div className='row'>
          <div className='col'>
            <h2 style={{color:'white'}}>Fault Control System</h2>
          </div>
        </div>

        <div className='row'>
          <div className='col'>
            <h3 style={{textAlign:'center',color:'white'}}>Failures</h3>
            <br />
          </div>
        </div>

        <div className='row'>
          <div className='col' style={{backgroundColor:'white'}}>
            <h4 style={{textAlign:'center',marginTop:10}}>Acambaro Plant</h4>
            {tasks_acambaro}
          </div>
          <div className='col' style={{backgroundColor:'white',marginLeft:20}}>
            <h4 style={{textAlign:'center',marginTop:10}}>Celaya Plant</h4>
            {tasks_celaya}
          </div>
        </div>

      </div>
    );
  }
}

class TaskAcambaro extends Component {
  constructor(props) {    
    super(props);
    this._onClick = this._onClick.bind(this);
  }
  _onClick() {
    this.props.onTaskClick(this.props.task.id);
  }
  render() {
    return (
      <div className="card" key={this.props.task.id}>
        <div className="card-body">
          <h5 className="card-title">Plant: Acámbaro &nbsp;&nbsp;&nbsp;  Machine: {this.props.task.maquina}</h5>
          <p className="card-text">Description: {this.props.task.descripcion} <br />Date: {this.props.task.fecha}</p>
        </div>
      </div>
    );
  }
}

class TaskCelaya extends Component {
  constructor(props) {    
    super(props);
    this._onClick = this._onClick.bind(this);
  }
  _onClick() {
    this.props.onTaskClick(this.props.task.id);
  }
  render() {
    return (
      <div className="card" key={this.props.task.id}>
        <div className="card-body">
          <h5 className="card-title">Plant: Celaya &nbsp;&nbsp;&nbsp;  Machine: {this.props.task.maquina}</h5>
          <p className="card-text">Description: {this.props.task.descripcion} <br />Date: {this.props.task.fecha}</p>
        </div>
      </div>
    );
  }
}


export default App;

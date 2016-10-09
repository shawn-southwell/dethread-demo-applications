import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import Pending from './Pending.js';
import Performance from './Performance.js';
import Participate from './ParticipateButton.js';
import WorkerProcess from './workerProcess';
import Host from './Host.js';
import P2P from 'socket.io-p2p';
import io from 'socket.io-client';

let socket;
let p2p;
let dataFromHost;

class JoinSession extends Component {
	constructor() {
		super(); 
		this.state = {
			hasMaster: false,
			isMaster: false,
			userParticipation: false,
			calculating: false,
			hasSolution: false
		};
		this.checkMaster = this.checkMaster.bind(this);
		this.hosting = this.hosting.bind(this);
	}

	componentDidMount() {
	
	}

	checkMaster() {
		socket = io();
		const opts = { numClients : 10 }
		p2p = new P2P(socket,opts);

		p2p.on('connect', () => {
			console.log('connection formed!');
			// p2p.emit('checkMaster');
			// p2p.on('checkMaster', () => {
			// console.log('AG')
			//p2p.emit('availableMaster', this.state.hasMaster);
			//})
		});

		p2p.on('masterChosen', () => {
			console.log('You Are now a Slave');
			this.setState({ hasMaster: true });
		});
		
		// p2p.on('checkMaster', () => {
		// 	console.log('AG')
		// 	//p2p.emit('availableMaster', this.state.hasMaster);
		// })

		p2p.on('starting to crack', (data) => {
			dataFromHost = JSON.stringify(data);
			console.log(`Host started crack. Received data from host: ${dataFromHost}`);
			this.setState({ calculating: true });
		});
		// p2p.on('availableMaster', (res) => {
		// 	if (!this.state.hasMaster && res){
		// 		this.setState({hasMaster : res});
		// 	} 
		// 	console.log('generalStatement')
		// })
		
		p2p.on('crackedPassword', (data) => {
			console.log('success (data)', data);
			console.log(`Password has been found in ${data.duration} seconds: ${data.clearText}`);
			this.setState({ hasSolution: true });
		});

		this.setState({ userParticipation: true });
	}

	hosting() {		
		p2p.emit('masterChosen');
		this.setState({ hasMaster: true, isMaster: true }); 
	}

	render() {
		const sessionView = !this.state.userParticipation ? <Participate checkMaster={this.checkMaster} /> 
						 : !this.state.hasMaster ? <Host masterSelect={this.hosting} /> 
						 : this.state.isMaster ? <Performance p2p={p2p} /> 
						 : !this.state.calculating ? <Pending /> : <WorkerProcess p2p={p2p} data={dataFromHost} />; 
		return sessionView;
	}
}

export default JoinSession;
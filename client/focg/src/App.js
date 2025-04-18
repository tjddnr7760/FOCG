import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import './App.css';

const contractABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "player",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "actionId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "actionType",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "bool",
        "name": "success",
        "type": "bool"
      }
    ],
    "name": "ActionProcessed",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "getMapSize",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getMonsterState",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "x",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "y",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "hp",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "player",
        "type": "address"
      }
    ],
    "name": "getPlayerState",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "x",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "y",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "hp",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTurn",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "mapSize",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "monster",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "x",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "y",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "hp",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "newX",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "newY",
        "type": "uint256"
      }
    ],
    "name": "moveMonster",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "players",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "x",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "y",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "hp",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "active",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "actionType",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "x",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "y",
        "type": "uint256"
      }
    ],
    "name": "submitAction",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "turn",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

const CONTRACT_ADDRESS = "0xAeD0ff8385F4c00be62208792afEA187564af9C6";

function App() {
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);
  const [player, setPlayer] = useState({ x: 0, y: 0, hp: 100 });
  const [monster, setMonster] = useState({ x: 4, y: 4, hp: 50 });
  const [mapSize, setMapSize] = useState(5);
  const [turn, setTurn] = useState(true);
  const [pendingActions, setPendingActions] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const initWeb3 = async () => {
      if (window.ethereum) {
        const web3Instance = new Web3(window.ethereum);
        try {
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          setWeb3(web3Instance);
          setAccount(accounts[0]);
          const contractInstance = new web3Instance.eth.Contract(contractABI, CONTRACT_ADDRESS);
          setContract(contractInstance);
        } catch (error) {
          setError('MetaMask 연결에 실패했습니다.');
          console.error(error);
        }
      } else {
        setError('MetaMask가 필요합니다.');
      }
    };
    initWeb3();
  }, []);

  useEffect(() => {
    if (contract && account) {
      const fetchState = async () => {
        try {
          const mapSize = await contract.methods.getMapSize().call();
          const playerState = await contract.methods.getPlayerState(account).call();
          const monsterState = await contract.methods.getMonsterState().call();
          const turnState = await contract.methods.getTurn().call();

          setMapSize(Number(mapSize));
          setPlayer({
            x: Number(playerState.x),
            y: Number(playerState.y),
            hp: Number(playerState.hp)
          });
          setMonster({
            x: Number(monsterState.x),
            y: Number(monsterState.y),
            hp: Number(monsterState.hp)
          });
          setTurn(turnState);
        } catch (error) {
          setError('게임 상태를 가져오지 못했습니다.');
          console.error(error);
        }
      };
      fetchState();
    }
  }, [contract, account]);

  useEffect(() => {
    if (contract) {
      contract.events.ActionProcessed({}, (error, event) => {
        if (error) {
          console.error('이벤트 에러:', error);
          return;
        }
        const { player: eventPlayer, actionId, success } = event.returnValues;
        if (eventPlayer.toLowerCase() === account.toLowerCase()) {
          setPendingActions(prev => prev.filter(action => action.id !== actionId));
          if (!success) {
            setError('블록체인에서 액션이 거부되었습니다. 상태를 복구합니다.');
            fetchGameState();
          }
        }
      });
    }
  }, [contract, account]);

  const fetchGameState = async () => {
    if (contract && account) {
      const playerState = await contract.methods.getPlayerState(account).call();
      const monsterState = await contract.methods.getMonsterState().call();
      const turnState = await contract.methods.getTurn().call();
      setPlayer({
        x: Number(playerState.x),
        y: Number(playerState.y),
        hp: Number(playerState.hp)
      });
      setMonster({
        x: Number(monsterState.x),
        y: Number(monsterState.y),
        hp: Number(monsterState.hp)
      });
      setTurn(turnState);
    }
  };

  const handleKeyDown = async (e) => {
    if (!turn || !contract || !account || pendingActions.length > 0) return;
    let newX = player.x;
    let newY = player.y;

    if (e.key === 'ArrowUp' && player.y > 0) newY--;
    if (e.key === 'ArrowDown' && player.y < mapSize - 1) newY++;
    if (e.key === 'ArrowLeft' && player.x > 0) newX--;
    if (e.key === 'ArrowRight' && player.x < mapSize - 1) newX++;

    if (newX === monster.x && newY === monster.y) return;

    const actionId = Date.now().toString();
    setPlayer({ ...player, x: newX, y: newY });
    setTurn(false);
    setPendingActions(prev => [...prev, { id: actionId, x: newX, y: newY }]);

    try {
      await contract.methods.submitAction('move', newX, newY).send({
        from: account,
        gas: 300000
      });
    } catch (error) {
      setError('트랜잭션 실패');
      setPendingActions(prev => prev.filter(action => action.id !== actionId));
      fetchGameState();
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [player, monster, turn, contract, account, pendingActions]);

  const renderMap = () => {
    const tiles = [];
    for (let y = 0; y < mapSize; y++) {
      for (let x = 0; x < mapSize; x++) {
        const isPlayer = player.x === x && player.y === y;
        const isMonster = monster.x === x && monster.y === y;
        tiles.push(
          <div key={`${x}-${y}`} className="tile">
            {isPlayer && <span className="player">🧙</span>}
            {isMonster && <span className="monster">👹</span>}
          </div>
        );
      }
    }
    return tiles;
  };

  return (
    <div className="App">
      <h1>온체인 턴제 게임</h1>
      {error && <p className="error">{error}</p>}
      <div>
        <p>플레이어 HP: {player.hp}</p>
        <p>몬스터 HP: {monster.hp}</p>
        <p>턴: {turn ? '플레이어' : '몬스터'}</p>
        <p>계정: {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : '연결되지 않음'}</p>
      </div>
      <div className="map">{renderMap()}</div>
      <p>화살표 키로 이동하세요. 모든 액션은 블록체인에서 검증됩니다.</p>
    </div>
  );
}

export default App;
const express = require('express');
const mongoose = require('mongoose');
const Web3 = require('web3');
const { abi } = require('./VotingContractABI.json');
const crypto = require('crypto');

const app = express();
app.use(express.json());

// Connect to Ethereum (using Ganache for development)
const web3 = new Web3('http://localhost:7545');
const contractAddress = '0x123...'; // Your deployed contract address
const votingContract = new web3.eth.Contract(abi, contractAddress);

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/voting_system', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Schemas
const voterSchema = new mongoose.Schema({
  voterId: { type: String, unique: true },
  publicKey: String,
  hasVoted: Boolean
});

const candidateSchema = new mongoose.Schema({
  candidateId: Number,
  name: String,
  party: String,
  voteCount: Number
});

const Voter = mongoose.model('Voter', voterSchema);
const Candidate = mongoose.model('Candidate', candidateSchema);

// Generate cryptographic keys for voters
function generateKeys() {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
  });
  return { publicKey, privateKey };
}

// API Endpoints
app.post('/register', async (req, res) => {
  const { name, aadhar } = req.body;
  
  // Generate keys and voter ID
  const { publicKey } = generateKeys();
  const voterId = crypto.createHash('sha256').update(aadhar).digest('hex');
  
  // Store in MongoDB
  const voter = new Voter({ voterId, publicKey, hasVoted: false });
  await voter.save();
  
  // Register on blockchain
  const accounts = await web3.eth.getAccounts();
  await votingContract.methods.registerVoter(voterId, publicKey)
    .send({ from: accounts[0], gas: 3000000 });
  
  res.json({ voterId });
});

app.post('/vote', async (req, res) => {
  const { voterId, candidateId, signature } = req.body;
  
  // Verify signature
  const voter = await Voter.findOne({ voterId });
  if (!voter || voter.hasVoted) return res.status(400).send('Invalid voter');
  
  // Submit to blockchain
  const accounts = await web3.eth.getAccounts();
  await votingContract.methods.castVote(voterId, candidateId, signature)
    .send({ from: accounts[0], gas: 3000000 });
  
  // Update local DB
  voter.hasVoted = true;
  await voter.save();
  
  res.json({ success: true });
});

app.listen(5000, () => console.log('Server running on port 5000'));

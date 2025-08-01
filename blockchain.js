// Blockchain Connection Manager
class BlockchainManager {
    constructor() {
        this.web3 = null;
        this.contract = null;
        this.contractAddress = '0x123...'; // Your contract address
        this.contractABI = []; // Your contract ABI
        this.connected = false;
    }

    async init() {
        // Check if Web3 is injected (MetaMask)
        if (window.ethereum) {
            try {
                this.web3 = new Web3(window.ethereum);
                await window.ethereum.enable();
                
                // Get network ID
                const networkId = await this.web3.eth.net.getId();
                
                // Initialize contract
                this.contract = new this.web3.eth.Contract(
                    this.contractABI, 
                    this.contractAddress
                );
                
                this.connected = true;
                this.updateUI();
                return true;
            } catch (error) {
                console.error("User denied account access");
                return false;
            }
        } 
        // Fallback to local node
        else if (window.web3) {
            this.web3 = new Web3(window.web3.currentProvider);
            this.connected = true;
            this.updateUI();
            return true;
        } 
        // No web3 instance, use local or remote node
        else {
            this.web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:7545'));
            this.connected = true;
            this.updateUI();
            return true;
        }
    }

    updateUI() {
        // Update blockchain status across all pages
        const statusElements = document.querySelectorAll('.blockchain-info');
        if (statusElements) {
            statusElements.forEach(el => {
                el.textContent = this.connected ? 
                    'Connected to Ethereum Network' : 
                    'Not connected to blockchain';
                el.className = this.connected ? 
                    'blockchain-info text-success' : 
                    'blockchain-info text-danger';
            });
        }
    }

    async getCurrentBlock() {
        if (!this.connected) return 0;
        return await this.web3.eth.getBlockNumber();
    }

    async getTransactionHistory() {
        if (!this.connected) return [];
        
        // Get recent blocks and their transactions
        const currentBlock = await this.getCurrentBlock();
        const transactions = [];
        
        // Get last 5 blocks (for demo)
        for (let i = 0; i < 5; i++) {
            const block = await this.web3.eth.getBlock(currentBlock - i, true);
            if (block && block.transactions) {
                transactions.push(...block.transactions);
            }
        }
        
        return transactions.slice(0, 10); // Return max 10 transactions
    }

    async renderTransactionHistory() {
        const transactions = await this.getTransactionHistory();
        const transactionList = document.getElementById('transactionList');
        
        if (transactionList) {
            transactionList.innerHTML = '';
            
            if (transactions.length === 0) {
                transactionList.innerHTML = '<p>No recent transactions found</p>';
                return;
            }
            
            transactions.forEach(tx => {
                const txElement = document.createElement('div');
                txElement.className = 'transaction-item mb-2 p-2 border rounded';
                txElement.innerHTML = `
                    <div class="d-flex justify-content-between">
                        <span class="text-truncate" style="max-width: 150px;">${tx.hash}</span>
                        <span class="badge bg-info">${this.web3.utils.fromWei(tx.value, 'ether')} ETH</span>
                    </div>
                    <small class="text-muted">Block: ${tx.blockNumber}</small>
                `;
                transactionList.appendChild(txElement);
            });
        }
    }

    async connectWallet() {
        if (!this.connected) {
            const success = await this.init();
            if (!success) return false;
        }
        
        const accounts = await this.web3.eth.getAccounts();
        if (accounts.length > 0) {
            document.getElementById('walletAddress').value = accounts[0];
            return accounts[0];
        }
        return null;
    }
}

// Initialize blockchain manager
const blockchainManager = new BlockchainManager();

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    await blockchainManager.init();
    blockchainManager.renderTransactionHistory();
    
    // Update block number every 15 seconds
    setInterval(async () => {
        const blockNumber = await blockchainManager.getCurrentBlock();
        document.getElementById('currentBlock').textContent = blockNumber;
    }, 15000);
});

// Expose wallet connection to UI
window.connectWallet = async function() {
    const address = await blockchainManager.connectWallet();
    if (address) {
        alert(`Wallet connected: ${address}`);
    } else {
        alert('Could not connect wallet');
    }
};
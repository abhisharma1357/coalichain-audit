const main = artifacts.require('Main.sol');
const coalichain = artifacts.require('CoalichainToken.sol');
const Voting = artifacts.require('Voting.sol');
var Web3 = require("web3");
web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

//account[0] owner

//account[1] will make vote ballot for all

//accounts [2] , [3] , [4] candidates

//accounts [7], [8] , [9] voters.

contract('CoaliChain Audit', async (accounts) => {

    it('Should correctly initialize constructor values of Coalichain Token Contract', async () => {

        this.tokenhold = await coalichain.new({ gas: 60000000 });
        let totalSupply = await this.tokenhold.totalSupply.call();
        let adminAllowance = await this.tokenhold.adminAllowance.call();
        let adminAddr = await this.tokenhold.adminAddr.call();        
        let balance = await this.tokenhold.balanceOf(accounts[0]);
        assert.equal(balance.toNumber()/10**18, 770000000);
        assert.equal(totalSupply.toNumber()/10**18, 770000000);
        assert.equal(adminAllowance.toNumber()/10**18, 308000000);
        assert.equal(adminAddr, accounts[0]);
    
      });

      it('Should correctly initialize constructor values of Main Contract', async () => {

        this.mainhold = await main.new(this.tokenhold.address,{ gas: 60000000 });

      });

      it('Should correctly Send ZUZ token from Contract Coalichain to Voters', async () => {

        let balancesbeforeOwner = await this.tokenhold.balanceOf(accounts[0]);
        assert.equal(balancesbeforeOwner.toNumber()/10**18, 770000000);
        let balancesbeforeUser = await this.tokenhold.balanceOf(accounts[1]);
        assert.equal(balancesbeforeUser.toNumber(),0);
        await this.tokenhold.transfer(accounts[1],10000000);
        await this.tokenhold.transfer(accounts[7],5000000);
        await this.tokenhold.transfer(accounts[8],5000000);
        await this.tokenhold.transfer(accounts[9],5000000);        
    });

    it('Should Approve Coalichain Token Contract to spend token on the behalf of voters and ballot Creator', async () => {

        let allownaceBefore = await this.tokenhold.allowance(accounts[1],this.mainhold.address); 
        assert.equal(allownaceBefore.toNumber(),0,'allownace before');
        let aproove = await this.tokenhold.approve(accounts[0],10000000,{from:accounts[1]});
        let aproove1 = await this.tokenhold.approve(accounts[0],5000000,{from:accounts[7]});
        let aproove2 = await this.tokenhold.approve(accounts[0],5000000,{from:accounts[8]});
        let aproove3 = await this.tokenhold.approve(accounts[0],5000000,{from:accounts[9]});
        let allownaceNow = await this.tokenhold.allowance(accounts[1],accounts[0]); 
        //assert.equal(allownaceNow.toNumber(),10000000,'allowance after');
        let allownaceNow1 = await this.tokenhold.allowance(accounts[7],accounts[0]); 
        //assert.equal(allownaceNow1.toNumber(),5000000,'allowance after');
        let allownaceNow2 = await this.tokenhold.allowance(accounts[8],accounts[0]); 
        //assert.equal(allownaceNow2.toNumber(),5000000,'allowance after');
        let allownaceNow3 = await this.tokenhold.allowance(accounts[9],accounts[0]); 
        //assert.equal(allownaceNow3.toNumber(),5000000,'allowance after');

      });

      it('Should correctly deploy voting contract via Main contract by creating ballot', async () => {

        let balnow = await this.tokenhold.balanceOf(accounts[1]);
        let allowancethere = await this.tokenhold.allowance(accounts[1],accounts[0]);
        //console.log(balnow.toNumber());
        //console.log(allowancethere.toNumber());
        let initballot = await this.mainhold.createBallot([accounts[2]],100,{from : accounts[1],gas: 60000000});
        let ballotAddress = await this.mainhold.getBallotsAddresses();
        var ballotAddressZero = await ballotAddress[0];
      });

      it('Should deploy Voting contract from voting ballot in main contract', async () => {

        let ballotAddress = await this.mainhold.getBallotsAddresses();
        var ballotAddressZero = await ballotAddress[0]; 
        this.votinghold = Voting.at(ballotAddressZero);
        let candidateList = await this.votinghold.getCandidatesList();
        let candidateList0 = candidateList[[0]];
        let candidateList1 = candidateList[[1]];                
      });

      it('Should vote for valid candidate', async () => {
        let balance = await this.tokenhold.balanceOf.call(accounts[7]);
        let allowanceNow = await this.tokenhold.allowance(accounts[7],accounts[0]);
        let vote = await this.votinghold.voteForCandidate(accounts[2],100,{from : accounts[7]}); 
        let totalVotes = await this.votinghold.totalVotesFor(accounts[2]);
        let balance1 = await this.tokenhold.balanceOf.call(accounts[7]);
        let allowanceNow1 = await this.tokenhold.allowance(accounts[7],accounts[0]);
        //console.log(balance1.toNumber());
        //console.log(allowanceNow1.toNumber());          
      });

      it('Should Not vote for Invalid correlationID', async () => {
        let balance = await this.tokenhold.balanceOf.call(accounts[7]);
        let allowanceNow = await this.tokenhold.allowance(accounts[7],accounts[0]);
        let vote = await this.votinghold.voteForCandidate(accounts[2],500,{from : accounts[7]}); 
        let totalVotes = await this.votinghold.totalVotesFor(accounts[2]);
        let balance1 = await this.tokenhold.balanceOf.call(accounts[7]);
        let allowanceNow1 = await this.tokenhold.allowance(accounts[7],accounts[0]);
        //console.log(balance1.toNumber());
        //console.log(allowanceNow1.toNumber());          
      });

      it('Should Not vote for Invalid Candidate', async () => {
        try{let vote = await this.votinghold.voteForCandidate(accounts[5],500,{from : accounts[7]});
      }catch(error){
        var error_ = 'VM Exception while processing transaction: revert';
        assert.equal(error.message, error_, 'Token ammount');

      } 
      });

      it('Should set crowdsale address', async () => {

        let cAddress = await this.tokenhold.setCrowdsale(accounts[6],0); 
        let allowanace4 = await this.tokenhold.allowance(accounts[0],accounts[6]);
        //assert.equal(allowanace4/10**18,462000000); 
      });

      it('Should Unvote for valid candidate', async () => {
        
        try{let unvote1 = await this.votinghold.unvoteForCandidate(100); 
        let totalVotes1 = await this.votinghold.totalVotesFor(accounts[2]);
        console.log(totalVotes1.toNumber(),'total votes for accounts 2');
        }catch(error){
          var error_ = 'VM Exception while processing transaction: invalid opcode';
          assert.equal(error.message, error_, 'Token ammount');  
        }
      });

      it('Should not approve user to spend negative tokens', async () => {

        let allownaceBefore1 = await this.tokenhold.allowance(accounts[1],this.mainhold.address); 
        let aproove7 = await this.tokenhold.approve(accounts[0],-9000000,{from:accounts[1]});
        let allownaceBefore2 = await this.tokenhold.allowance(accounts[1],this.tokenhold.address); 
      });

      it('Should not increase approval user to spend negative tokens', async () => {
      try{
        let allownaceBefore11 = await this.tokenhold.allowance(accounts[1],accounts[0]); 
        let aproove71 = await this.tokenhold.increaseApproval(accounts[0],-9000000,{from:accounts[1]});
        let allownaceBefore21 = await this.tokenhold.allowance(accounts[1],accounts[0]);
        //console.log(allownaceBefore21); 
      }catch(error){
        var error_ = 'VM Exception while processing transaction: invalid opcode';
        assert.equal(error.message, error_, 'Token ammount');
      }
      
      });

      it('Should not decrease approval user to spend negative tokens', async () => {
        try{
          let allownaceBefore11 = await this.tokenhold.allowance(accounts[1],accounts[0]); 
          let aproove71 = await this.tokenhold.decreaseApproval(accounts[0],-9000000,{from:accounts[1]});
          let allownaceBefore21 = await this.tokenhold.allowance(accounts[1],accounts[0]);
          //console.log(allownaceBefore21); 
        }catch(error){
          var error_ = 'VM Exception while processing transaction: invalid opcode';
          assert.equal(error.message, error_, 'Token ammount');
        }
        
        });

        it('Should Enable transfer of tokens', async () => {

          let enable = await this.tokenhold.transferEnabled.call(); 
          assert.equal(enable,false);
          let enabled = await this.tokenhold.enableTransfer();
          let enable1 = await this.tokenhold.transferEnabled.call(); 
          assert.equal(enable1,true); 
        });
    
})

'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const P=require('../src/modules/pricing.js');
const O=require('../src/modules/operations-domain.js');
const Pay=require('../src/modules/payments.js');

test('import quote separates a 70% advance from combined shipping/customs without duplicate duty',()=>{
  const q=P.importQuote({origin:'China',priceBDT:1490,weight:.35,category:'Electronics',length:20,width:18,height:9});
  assert.equal(q.actualWeight,.35);assert.equal(q.volumetricWeight,.648);assert.equal(q.billableWeight,.648);
  assert.equal(q.shipping,616);assert.equal(q.total,2186);assert.equal(q.advance,1043);assert.equal(q.balance,1143);
  assert.equal(q.service,0);assert.equal(q.duties,0);assert.equal(q.items+q.shipping+q.delivery,q.total);
});
test('dimensional pricing validates dimensions and chooses the larger weight',()=>{
  assert.equal(P.weight({weight:.2,length:50,width:40,height:30}).billableWeight,12);
  assert.equal(P.weight({weight:4,length:10,width:10,height:10}).billableWeight,4);
  assert.throws(()=>P.weight({weight:.2,length:10}),RangeError);
  assert.throws(()=>P.weight({weight:.2,length:-1,width:10,height:10}),RangeError);
  assert.throws(()=>P.importQuote({origin:'China',priceBDT:10,weight:1,category:'unknown'}),RangeError);
});
test('DDP illustration accounts for every component in minor units and converts fixture currencies',()=>{
  const q=P.exportQuote({supplyBDT:420,weight:.4,length:32,width:25,height:5,quantity:2,destination:'UK',currency:'GBP'});
  const sum=q.supplyMinor+q.marginMinor+q.firstMileMinor+q.freightMinor+q.insuranceMinor+q.dutyMinor+q.vatMinor+q.brokerageMinor+q.lastMileMinor;
  assert.equal(q.totalMinor,sum);assert.equal(q.displayMinor,Math.round(sum/156));assert.equal(q.requiresBrokerReview,true);
  assert.ok(Number.isSafeInteger(q.totalMinor));assert.equal(q.billableWeight,1.6);
});
test('export workflow rejects unauthorized role actions and low-confidence approval without human review',()=>{
  const s=O.initial();assert.throws(()=>O.command(s,'Maker','approve',{id:'EX-DEMO-2001'}));
  assert.throws(()=>O.command(s,'Broker','approve',{id:'EX-DEMO-2002',humanConfirmed:false}));
  assert.throws(()=>O.command(s,'Maker','submit',{listingId:'E005',quantity:1,destination:'UK',currency:'GBP'}));
  assert.equal(O.runAgents('E005')[2].status,'blocked');assert.equal(O.runAgents('E002')[1].status,'review');
});
test('hub verification, documents and consolidation gate departure and idempotent balanced payout',()=>{
  let s=O.initial();s=O.command(s,'Broker','approve',{id:'EX-DEMO-2001',humanConfirmed:true});
  assert.throws(()=>O.command(s,'Warehouse','depart',{id:'EX-DEMO-2001'}));
  s=O.command(s,'Warehouse','intake',{id:'EX-DEMO-2001',weight:.6,length:40,width:30,height:10});
  assert.equal(O.quote(s.orders[0]).billableWeight,4.8);
  s=O.command(s,'Warehouse','consolidate',{id:'EX-DEMO-2001'});
  assert.throws(()=>O.command(s,'Warehouse','depart',{id:'EX-DEMO-2001'}));
  s=O.command(s,'Broker','document',{id:'EX-DEMO-2001'});
  s=O.command(s,'Warehouse','depart',{id:'EX-DEMO-2001'});
  assert.equal(s.orders[0].statusIndex,5);
  s=O.command(s,'Finance','payout',{id:'EX-DEMO-2001',method:'bkash'});
  const count=s.journals.length;s=O.command(s,'Finance','payout',{id:'EX-DEMO-2001',method:'bkash'});
  assert.equal(s.journals.length,count);assert.equal(s.orders[0].paidOut,true);assert.ok(s.journals.every(O.balanced));
  assert.equal(O.initial().orders[0].statusIndex,1);
});
test('payment state machine forbids duplicate terminal settlement and invalid jumps',()=>{
  assert.equal(Pay.transition('METHOD','VERIFY'),'VERIFY');assert.equal(Pay.transition('VERIFY','PROCESSING'),'PROCESSING');
  assert.equal(Pay.transition('PROCESSING','PAID'),'PAID');assert.throws(()=>Pay.transition('METHOD','PAID'));
  for(const state of ['PAID','FAILED','CANCELLED','EXPIRED'])assert.throws(()=>Pay.transition(state,'PAID'));
});

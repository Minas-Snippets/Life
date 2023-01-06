const a    = Array();
const born = Array();
const died = Array();

const mid = (x,y) => Math.floor((x+y)/2);

const le = (x,y) => x[0]<y[0] || (x[0]==y[0] && x[1]<=y[1]);

const lt = (x,y) => x[0]<y[0] || (x[0]==y[0] && x[1]<y[1]);

const eq = (x,y) => x[0]==y[0] && x[1]==y[1];

const ω  = (b) => b[b.length - 1];

function printA() {
    s = "A[" + a.length + "] = ";
    for(let i = 0; i < a.length; i++)
        s += "(" + a[i][0] + "," + a[i][1] + ") ";
    console.log(s);
}

const neighbours = (x) => [ 
    [x[0]-1,x[1]-1],[x[0]-1,x[1]],[x[0]-1,x[1]+1],
    [x[0],  x[1]-1],              [x[0]  ,x[1]+1],
    [x[0]+1,x[1]-1],[x[0]+1,x[1]],[x[0]+1,x[1]+1]];
    

const insBound = (b,x,l,u) => 
    le(x,b[l]) || le(b[u],x) ? false :
    lt(x,b[l+1]) ? b.splice(l+1,0,x) :
    lt(b[u-1],x) ? b.splice(u,0,x) :
    le(x,b[mid(l,u)]) ? insBound(b,x,l+1,mid(l,u)) :
    insBound(b,x,mid(l,u), u-1);
                    
const ins = (b,x) => b.length == 0 || lt(ω(b),x) ? b.push(x) : 
    lt(x,b[0]) ? b.unshift(x) : insBound(b,x,0,b.length -1);      
    
const remBound = (b,x,l,u) => 
    eq(x,b[l]) ? b.splice(l,1) :
    eq(x,b[u]) ? b.splice(u,1) :
    le(x,b[mid(l,u)]) ? remBound(b,x,l,mid(l,u)) :
    remBound(b,x,mid(l,u),u);
            
const rem = (b,x) => b.length == 0 || lt(x,b[0]) || lt(ω(b),x) ? 0 : remBound(b,x,0,b.length -1);
    
const hasIndBound = (b,x,l,u) => 
    eq(x,b[l]) ? l : 
    eq(x,b[u]) ? u :
    lt(x,b[l+1]) || lt(b[u-1],x) ? -1 :
    le(x,b[mid(l,u)])            ? hasIndBound(b,x,l+1,mid(l,u)) : 
    hasIndBound(b,x,mid(l,u),u-1);

const hasInd = (b,x) => b.length == 0 || lt(x,b[0]) || lt(ω(b),x) ? -1 : hasIndBound(b,x,0, b.length-1);

const addSet = (s,b) => b.forEach( x => ins(s,x));

const remSet = (s,b) => b.forEach( x => rem(s,x));

function gen() {
    born.length = 0;
    died.length = 0;
    let n = a.length;
    let looked = [ ];
    for(let i = 0; i < n; i++) {
        const v = neighbours(a[i]);
        let d = 0;
        for(let j = 0; j < 8; j++) {
            if(hasInd(a,v[j]) >= 0) {
                d++; 
            } else {
                if(hasInd(looked, v[j]) < 0) {
                    const w = neighbours(v[j]);
                    let b = 0;
                    for(let k = 0; k < 8 && b < 4;k++) 
                        if(hasInd(a,w[k]) >= 0) b++;
                    if(b == 3) born.push(v[j]);
                    ins(looked,v[j]);
                }
            }
        }
        if(d < 2 || d > 3) died.push(a[i]);
    }
    remSet(a,died);
    addSet(a,born);
    return [ born.length + died.length, born.length - died.length ]
}

const acp = v => { const w = []; v.forEach( x => w.push(x) ); return w };



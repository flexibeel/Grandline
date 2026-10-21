import json, sys
from PIL import Image

PAL = {
 'k':'#2b1d14',
 'j':'#d9a35c','b':'#b07a44','B':'#8a5a30','d':'#5e3b1d','D':'#3f2628',
 'w':'#fbf6ea','W':'#d9cfbc','V':'#a9a2b4',
 'r':'#d8433a','R':'#9a2a22','x':'#5e1f2a',
 'y':'#f2c94c','Y':'#b8862a','f':'#ffe28a','o':'#f08a24',
 's':'#dfe3ea','S':'#9aa3b2','t':'#5d6575','T':'#363a4e',
 'q':'#c9a8ef','p':'#9b6fd1','P':'#5e3a8a',
}

def grid(W,H): return [['.']*W for _ in range(H)]
def put(g,x,y,ch):
    if 0<=y<len(g) and 0<=x<len(g[0]): g[y][x]=ch
def hull(W,H,c,prof,inset,fill,edge,x_off=0):
    g=grid(W,H); cells=set()
    for x,h in enumerate(prof):
        hh=h-inset
        if hh<0: continue
        for y in range(c-hh,c+hh+1): cells.add((x+x_off,y))
    # trim ends by inset
    xs=[x for x,_ in cells]
    if inset:
        lo,hi=min(xs),max(xs)
        cells={(x,y) for x,y in cells if lo+inset-1<=x<=hi-inset+1} if inset>1 else cells
    for (x,y) in cells:
        n=[(x+1,y),(x-1,y),(x,y+1),(x,y-1)]
        put(g,x,y, edge if any(p not in cells for p in n) else fill)
    return g
def rows(g): return [''.join(r) for r in g]

# ---------------- PLAYER ----------------
def player():
    W,H,c=24,11,5
    prof=[2,3]+[4]*12+[3,3,3,2,2,1,1,0]   # x0..21
    L=[]
    L.append(hull(W,H,c,prof,3,'D','D'))
    L.append(hull(W,H,c,prof,2,'d','D'))
    L.append(hull(W,H,c,prof,1,'B','d'))
    deck=hull(W,H,c,prof,0,'b','d')
    for x in range(3,13):
        if x%4!=1: put(deck,x,3,'B'); put(deck,x,7,'B')
    put(deck,2,4,'j'); put(deck,3,4,'j')
    L.append(deck)
    # rail layer: ring only + cannons + bowsprit
    rail=grid(W,H)
    for y,row in enumerate(deck):
        for x,ch in enumerate(row):
            if ch=='d': put(rail,x,y,'j' if (y<c or (y==c and x<11)) else 'b')
    for x in (6,10,14):
        put(rail,x,0,'T'); put(rail,x,10,'T'); put(rail,x,1,'t'); put(rail,x,9,'t')
    put(rail,22,5,'B'); put(rail,23,5,'d')
    put(rail,9,5,'d'); put(rail,15,5,'d')       # mast feet
    put(rail,4,5,'B')                            # wheel
    L.append(rail)
    # stern cabin (2 layers)
    cab=grid(W,H)
    for y in range(2,9):
        for x in range(1,6):
            edge = y in (2,8) or x in (1,5)
            put(cab,x,y,'d' if edge else 'B')
    put(cab,9,5,'d'); put(cab,15,5,'d')
    L.append(cab)
    roof=grid(W,H)
    for y in range(2,9):
        for x in range(1,6):
            edge = y in (2,8) or x in (1,5)
            put(roof,x,y,('B' if (y==2 or x==1) else 'd') if edge else ('j' if y==3 else 'b'))
    put(roof,3,5,'f')          # Laterne auf dem Heck (einziger Glanzpunkt)
    put(roof,9,5,'d'); put(roof,15,5,'d')
    L.append(roof)
    # sails: main at x8/9, fore at x14/15, bellied forward (+x) in the middle
    def sail(span_main,span_fore,top=False):
        g=grid(W,H)
        for (mx,(a,b)) in ((8,span_main),(14,span_fore)):
            for y in range(a,b+1):
                belly = 1 if abs(y-c)<=1 else 0
                ends = y in (a,b)
                put(g,mx+belly,y,'V' if ends else 'W')       # back face (shade)
                put(g,mx+belly+1,y,'W' if ends else 'w')     # front face (lit)
        return g
    for _ in range(4): L.append(sail((1,9),(2,8)))
    for _ in range(2): L.append(sail((2,8),(3,7)))
    L.append(sail((3,7),(4,6)))
    yard=grid(W,H)
    for y in range(3,8): put(yard,9,y,'B')
    for y in range(4,7): put(yard,15,y,'B')
    put(yard,9,3,'d'); put(yard,9,7,'d'); put(yard,15,4,'d'); put(yard,15,6,'d')
    L.append(yard)
    flag=grid(W,H)
    put(flag,9,5,'d'); put(flag,8,5,'r'); put(flag,7,5,'r'); put(flag,6,5,'R'); put(flag,7,4,'r'); put(flag,6,6,'R')
    L.append(flag)
    return [rows(g) for g in L]

# ---------------- ENEMY ----------------
def enemy():
    W,H,c=13,7,3
    prof=[1,2]+[2]*5+[2,1,1,1,0]   # x0..11
    L=[]
    L.append(hull(W,H,c,prof,1,'D','D'))
    deck=hull(W,H,c,prof,0,'B','d')
    put(deck,3,3,'b'); put(deck,4,3,'b'); put(deck,6,3,'b')
    L.append(deck)
    rail=grid(W,H)
    for y,row in enumerate(deck):
        for x,ch in enumerate(row):
            if ch=='d': put(rail,x,y,'b' if y<c else 'B')
    put(rail,9,1,'t'); put(rail,9,0,'T')     # Drehbasse vorn
    put(rail,12,3,'B'); put(rail,6,3,'d')
    L.append(rail)
    # lateen sail along the ship axis (offset to lee side row 2)
    spans=[(3,9),(3,9),(4,9),(5,9),(6,9),(7,9)]
    for i,(a,b) in enumerate(spans):
        g=grid(W,H)
        for x in range(a,b+1):
            put(g,x,2,'q' if x<b else 'p')
            put(g,x,3,'P' if x in (a,b) else 'p')
        if i==0: put(g,6,3,'d')
        L.append(g)
    g=grid(W,H); put(g,9,3,'d'); put(g,9,2,'P'); put(g,8,1,'r'); L.append(g)
    return [rows(g) for g in L]

# ---------------- BOSS ----------------
def boss():
    W,H,c=38,19,9
    prof=[5,6,7]+[8]*22+[7,7,7,6,6,5,5,4,3,2,1,0]   # x0..36? len
    prof=prof[:36]
    L=[]
    L.append(hull(W,H,c,prof,4,'D','D'))
    L.append(hull(W,H,c,prof,3,'D','x'))
    L.append(hull(W,H,c,prof,2,'d','D'))
    gun=hull(W,H,c,prof,1,'d','D')
    L.append(gun)
    deck=hull(W,H,c,prof,0,'B','d')
    for x in range(4,26):
        if x%5!=2:
            put(deck,x,5,'d'); put(deck,x,13,'d')
    L.append(deck)
    rail=grid(W,H)
    for y,row in enumerate(deck):
        for x,ch in enumerate(row):
            if ch=='d' and (y in (1,17) or x<=3 or x>=25 or row[x-1]=='.' or row[x+1]=='.' or deck[y-1][x]=='.' or deck[y+1][x]=='.'):
                put(rail,x,y,'y' if y<c else 'Y')
    for x in (7,11,15,19,23):
        put(rail,x,0,'T'); put(rail,x,18,'T'); put(rail,x,1,'t'); put(rail,x,17,'t')
    put(rail,36,9,'y'); put(rail,37,9,'Y')    # goldene Galionsfigur
    for mx in (10,18,26): put(rail,mx,9,'D')
    L.append(rail)
    # big stern castle 3 layers
    for i in range(3):
        g=grid(W,H)
        for y in range(3,16):
            for x in range(1,8):
                edge = y in (3,15) or x in (1,7)
                if i<2: put(g,x,y,'d' if edge else 'B')
                else: put(g,x,y,('y' if (y==3 or x==1) else 'Y') if edge else ('b' if y==4 else 'B'))
        if i==1:
            put(g,1,5,'f'); put(g,1,13,'f')      # Heckfenster leuchten
        if i==2:
            put(g,4,9,'o')                       # Feuerkorb, glueht beim Ausholen
        for mx in (10,18,26): put(g,mx,9,'D')
        L.append(g)
    def sail(spans):
        g=grid(W,H)
        for mx,(a,b) in zip((10,18,26),spans):
            for y in range(a,b+1):
                belly = 1 if abs(y-c)<=2 else 0
                ends = y in (a,b)
                put(g,mx+belly,y,'x' if ends else 'R')
                put(g,mx+belly+1,y,'R' if ends else 'r')
        return g
    full=((2,16),(2,16),(4,14))
    mid=((3,15),(3,15),(5,13))
    L += [sail(full)]*4+[sail(mid)]*3+[sail(((4,14),(4,14),(6,12)))]
    yard=grid(W,H)
    for mx,(a,b) in zip((10,18,26),((4,14),(4,14),(6,12))):
        for y in range(a,b+1): put(yard,mx+1,y,'d')
    L.append(yard)
    flag=grid(W,H)
    put(flag,18,9,'D')
    for x,y,ch in ((17,9,'x'),(16,9,'x'),(15,9,'T'),(16,8,'x'),(15,10,'T'),(16,10,'s')):
        put(flag,x,y,ch)
    L.append(flag)
    return [rows(g) for g in L]

def stack_img(layers,angle,scale=6):
    import math
    h=len(layers[0]); w=len(layers[0][0])
    size=int(math.hypot(w,h))+2; n=len(layers)
    out=Image.new('RGBA',(size,size+n),(63,143,192,255))
    for i,lay in enumerate(layers):
        im=Image.new('RGBA',(w,h),(0,0,0,0))
        for y,r in enumerate(lay):
            for x,ch in enumerate(r):
                if ch!='.': im.putpixel((x,y),Image.new('RGB',(1,1),PAL[ch]).getpixel((0,0))+(255,))
        im=im.rotate(angle,resample=Image.NEAREST,expand=True)
        ox=(size-im.width)//2; oy=(size-im.height)//2+n-i
        out.alpha_composite(im,(ox,oy))
    return out.resize((out.width*scale,out.height*scale),Image.NEAREST)

if __name__=='__main__':
    ships={'PLAYER':player(),'ENEMY':enemy(),'BOSS':boss()}
    for k,v in ships.items():
        w={len(r) for l in v for r in l}; h={len(l) for l in v}
        assert len(w)==1 and len(h)==1,(k,w,h)
        print(k,'layers',len(v),'w',w,'h',h)
    json.dump(ships,open(sys.argv[1],'w'))
    for k,v in ships.items():
        ims=[stack_img(v,a,4) for a in (0,30,90,200)]
        W=sum(i.width for i in ims); H=max(i.height for i in ims)
        sheet=Image.new('RGBA',(W,H),(63,143,192,255)); x=0
        for i in ims: sheet.paste(i,(x,0)); x+=i.width
        sheet.save(sys.argv[2]+f'/{k}.png')

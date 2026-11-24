from PIL import Image, ImageDraw
from pathlib import Path
scale=10
TUTORIAL_ROOT = Path(__file__).resolve().parents[1]
REPO_ROOT = TUTORIAL_ROOT.parents[1]
src = TUTORIAL_ROOT / "public/images/chatgpt-dialog-filled.png"
out=Image.open(src).convert('RGB')

# Edit only the checkbox crop so the rest of the PNG remains pixel-identical and compact.
box=(530,730,560,762)
crop=out.crop(box)
big=crop.resize((crop.width*scale,crop.height*scale),Image.Resampling.LANCZOS)
d=ImageDraw.Draw(big)
# Clear the empty checkbox/shadow with the surrounding panel color, then draw the checked control.
d.rectangle((0,0,big.width,big.height),fill=(252,252,252))
x,y,w,h=537,738,15,15
ox,oy=box[0],box[1]
X,Y=(x-ox)*scale,(y-oy)*scale
W,H=w*scale,h*scale
d.rounded_rectangle((X,Y,X+W-1,Y+H-1),radius=3*scale,fill=(20,20,20))
d.line([(X+3.2*scale,Y+7.3*scale),(X+6.1*scale,Y+10.1*scale),(X+11.8*scale,Y+3.9*scale)],fill='white',width=int(1.8*scale),joint='curve')
for cx,cy in [(X+3.2*scale,Y+7.3*scale),(X+11.8*scale,Y+3.9*scale)]:
 r=0.9*scale
 d.ellipse((cx-r,cy-r,cx+r,cy+r),fill='white')
out.paste(big.resize(crop.size,Image.Resampling.LANCZOS),box)

# Recolor the disabled gray Create button to the enabled black style with a smooth alpha ramp.
pix=out.load()
for yy in range(806,856):
 for xx in range(920,1085):
  r,g,b=pix[xx,yy]
  if abs(r-g) <= 5 and abs(g-b) <= 7:
   lum=(r+g+b)/3
   alpha=max(0,min(1,(232-lum)/(232-156)))
   if alpha:
    target=18
    pix[xx,yy]=tuple(round((1-alpha)*c+alpha*target) for c in (r,g,b))

for path in [
 TUTORIAL_ROOT / "public/images/chatgpt-dialog-confirmed.png",
 REPO_ROOT / "public/images/desktop/chatgpt-dialog-confirmed.png",
]:
 out.save(path, compress_level=9, optimize=True)
 print(path)

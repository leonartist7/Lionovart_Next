"""Freeze italic weight 500 and union overlaps before beveling.
Build-only requirements: fonttools[woff], skia-pathops. No browser dependency.
"""
import sys
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.ttLib.removeOverlaps import removeOverlaps

font=TTFont(sys.argv[1])
font=instantiateVariableFont(font,{'wght':500},inplace=True)
removeOverlaps(font,glyphNames=['R','O','A'],removeHinting=True)
font.flavor=None
font.save(sys.argv[2])

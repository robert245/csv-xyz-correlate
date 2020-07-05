#CSV XYZ Correlate
because I'm bad at names.

## Description
Given a file containing a list of `(x,y,z)` coordinates, and another file containing `(x,y,z,w)`, this script 
will write a new output file of `(x,y,z,w)` where the first input list is matched with the closest `w` value within
the second list

Distance is calculated via the standard distance formula, which is `sqrt((x2−x1)^2+(y2−y1)^2+(z2−z1)^2)`.

## Usage
```shell script
export XYZ_FILE='./src/test/resources/xyz.csv';
export XYZW_FILE='./src/test/resources/xyzw.csv';
export OUTPUT_FILE='./src/test/resources/output.csv';
npm start
```

If you want, you can alias this as a script
```shell script
npm install && npm bin && npm link
```
and then just run 
```shell script
export XYZ_FILE='./src/test/resources/xyz.csv';
export XYZW_FILE='./src/test/resources/xyzw.csv';
export OUTPUT_FILE='./src/test/resources/output.csv';
csv-xyz-correlate
```

## Notes
This is not commercial-quality code, it's missing tests and could contain typos and logic errors.  Caveat emptor.
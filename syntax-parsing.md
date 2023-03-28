
## Example 1:

```
BAR [4/4] TEMPO 60 [1/4]
```

compiles to 

```
{
  bar: 1,
  beat: 1,
  signature: {
    empty: false,
    name: '4/4',
    type: 'simple',
    upper: 4,
    lower: 4,
    additive: []
  },
  basis: {
    empty: false,
    name: '1/4',
    type: 'simple',
    upper: 1,
    lower: 4,
    additive: []
  },
  bpm: 60,
  bpmCurve: null,
  fermata: null,
  label: null,
}
```

## Example 2:

```

```

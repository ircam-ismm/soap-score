# SO(a)P Score

SO(a)P score is a mini-langage to describe structure of a score along with a javascript interpreter and audio engine to create application such as sequencers, metronomes, etc.

## Example application

[https://ircam-ismm.github.io/soap-score/](https://ircam-ismm.github.io/soap-score/)

## Score syntax

```
BAR 1 [3+2+2/8] TEMPO [3/8]=60
BAR 2 [3+2+2/8] TEMPO [3/8]=60 curve 2
BAR 4 [2+3+2/8] TEMPO [3/8]=120
```

[Syntax documentation](./docs/SYNTAX.md)

## Credits

The project has received support from the SO(a)P UPI project financed by Ircam and from the DOTS project (ANR-22-CE33-0013-01) financed by the French National Research Agency (ANR).

## License

[BSD-3-Clause](./LICENSE)

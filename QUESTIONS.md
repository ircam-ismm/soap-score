# QUESTIONS (and sometimes answers...)

## 1

Can we write:

```
BAR 12 [3/4]
|2 TEMPO 60 FERMATA
```

or do we have to write:

```
BAR 12 [3/4] 
|2 "label"
|1 TEMPO 60 
|2 FERMATA
```

i.e. only one command allowed per beat ?

--> answer: this is implemented anyway...

## 2

Not completely sure what this should do

```
BAR 21 [4/4] "maMesure21"
| TEMPO 63.4
|3.5 TEMPO 80 // le changement de tempo intervient sur la 6e croche
```

## 3

Can we define an absolute duration on a beat?

```
BAR 2 [4/4] TEMPO 60
|3 [2s]
```

(...that's a bit weird...)

--> answer: no this is actaully a FERMATA

```
BAR 2 [4/4] TEMPO 60
|3 FERMATA [2s]
```

## 4

Do we keep brackets for absolute time definitions

```
BAR 4 [2s]
|3 FERMATA [2s]
```

or 

```
BAR 4 2s
|3 FERMATA 2s
```

--> no sure, maybe w/ brackets is more consistent

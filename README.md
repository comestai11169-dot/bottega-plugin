# bottega-plugin

Mod di Claude della Bottega di Fulgo.

## barra-consumi

Una riga sopra il campo del messaggio: limite di 5 ore (e quando si libera), limite della settimana e quanto è piena la chat. Diventa gialla quando la chat supera il 60% e avvisa all'80% e al 95% del limite di 5 ore. Legge solo i numeri che Claude già mostra nella riga di stato; non manda niente fuori.

## Installazione

Al prompt di una sessione nel terminale:

```
/plugin install barra-consumi --marketplace comestai11169-dot/bottega-plugin
```

poi `y` per aggiungere il marketplace e scegli dove installarla.

Da una shell:

```
claude plugin install barra-consumi --marketplace comestai11169-dot/bottega-plugin
```

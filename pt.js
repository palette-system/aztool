
var default_list = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
var pattern_list = [];
var pattern_count = 0;
function add_pattern() {
    var i01, i02, i03, i04, i05, i06, i07, i08, i09, i10, i11, i12, i13, i14, i15, i16, i17, i18, i19, i20;
    var maxnum = 20;
    for (i01=0; i01<maxnum; i01++) {
        for (i02=0; i02<maxnum; i02++) {
            if (i01 == i02) continue;
            for (i03=0; i03<maxnum; i03++) {
                if (i01 == i03 || i02 == i03) continue;
                for (i04=0; i04<maxnum; i04++) {
                    if (i01 == i04 || i02 == i04 || i03 == i04) continue;
                    for (i05=0; i05<maxnum; i05++) {
                        if (i01 == i05 || i02 == i05 || i03 == i05 || i04 == i05) continue;
                        for (i06=0; i06<maxnum; i06++) {
                            if (i01 == i06 || i02 == i06 || i03 == i06 || i04 == i06 || i04 == i06 || i05 == i06) continue;
                            for (i07=0; i07<maxnum; i07++) {
                                if (i01 == i07 || i02 == i07 || i03 == i07 || i04 == i07 || i04 == i07 || i05 == i07 || i06 == i07) continue;
                                for (i08=0; i08<maxnum; i08++) {
                                    if (i01 == i08 || i02 == i08 || i03 == i08 || i04 == i08 || i04 == i08 || i05 == i08 || i06 == i08 || i07 == i08) continue;
                                    for (i09=0; i09<maxnum; i09++) {
                                        if (i01 == i09 || i02 == i09 || i03 == i09 || i04 == i09 || i04 == i09 || i05 == i09 || i06 == i09 || i07 == i09 || i08 == i09) continue;
                                        for (i10=0; i10<maxnum; i10++) {
                                            if (i01 == i10 || i02 == i10 || i03 == i10 || i04 == i10 || i04 == i10 || i05 == i10 || i06 == i10 || i07 == i10 || i08 == i10 || i09 == i10) continue;
                                            for (i11=0; i11<maxnum; i11++) {
                                                if (i01 == i11 || i02 == i11 || i03 == i11 || i04 == i11 || i04 == i11 || i05 == i11 || i06 == i11 || i07 == i11 || i08 == i11 || i09 == i11 || i10 == i11) continue;
                                                for (i12=0; i12<maxnum; i12++) {
                                                    if (i01 == i12 || i02 == i12 || i03 == i12 || i04 == i12 || i04 == i12 || i05 == i12 || i06 == i12 || i07 == i12 || i08 == i12 || i09 == i12 || i10 == i12 || i11 == i12) continue;
                                                    for (i13=0; i13<maxnum; i13++) {
                                                        if (i01 == i13 || i02 == i13 || i03 == i13 || i04 == i13 || i04 == i13 || i05 == i13 || i06 == i13 || i07 == i13 || i08 == i13 || i09 == i13 || i10 == i13 || i11 == i13 || i12 == i13) continue;
                                                        for (i14=0; i14<maxnum; i14++) {
                                                            if (i01 == i14 || i02 == i14 || i03 == i14 || i04 == i14 || i04 == i14 || i05 == i14 || i06 == i14 || i07 == i14 || i08 == i14 || i09 == i14 || i10 == i14 || i11 == i14 || i12 == i14 || i13 == i14) continue;
                                                            for (i15=0; i15<maxnum; i15++) {
                                                                if (i01 == i15 || i02 == i15 || i03 == i15 || i04 == i15 || i04 == i15 || i05 == i15 || i06 == i15 || i07 == i15 || i08 == i15 || i09 == i15 || i10 == i15 || i11 == i15 || i12 == i15 || i13 == i15 || i14 == i15) continue;
                                                                for (i16=0; i16<maxnum; i16++) {
                                                                    if (i01 == i16 || i02 == i16 || i03 == i16 || i04 == i16 || i04 == i16 || i05 == i16 || i06 == i16 || i07 == i16 || i08 == i16 || i09 == i16 || i10 == i16 || i11 == i16 || i12 == i16 || i13 == i16 || i14 == i16 || i15 == i16) continue;
                                                                    for (i17=0; i17<maxnum; i17++) {
                                                                        if (i01 == i17 || i02 == i17 || i03 == i17 || i04 == i17 || i04 == i17 || i05 == i17 || i06 == i17 || i07 == i17 || i08 == i17 || i09 == i17 || i10 == i17 || i11 == i17 || i12 == i17 || i13 == i17 || i14 == i17 || i15 == i17 || i16 == i17) continue;
                                                                        for (i18=0; i18<maxnum; i18++) {
                                                                            if (i01 == i18 || i02 == i18 || i03 == i18 || i04 == i18 || i04 == i18 || i05 == i18 || i06 == i18 || i07 == i18 || i08 == i18 || i09 == i18 || i10 == i18 || i11 == i18 || i12 == i18 || i13 == i18 || i14 == i18 || i15 == i18 || i16 == i18 || i17 == i18) continue;
                                                                            for (i19=0; i19<maxnum; i19++) {
                                                                                if (i01 == i19 || i02 == i19 || i03 == i19 || i04 == i19 || i04 == i19 || i05 == i19 || i06 == i19 || i07 == i19 || i08 == i19 || i09 == i19 || i10 == i19 || i11 == i19 || i12 == i19 || i13 == i19 || i14 == i19 || i15 == i19 || i16 == i19 || i17 == i19 || i18 == i19) continue;
                                                                                for (i20=0; i20<maxnum; i20++) {
                                                                                    if (i01 == i20 || i02 == i20 || i03 == i20 || i04 == i20 || i04 == i20 || i05 == i20 || i06 == i20 || i07 == i20 || i08 == i20 || i09 == i20 || i10 == i20 || i11 == i20 || i12 == i20 || i13 == i20 || i14 == i20 || i15 == i20 || i16 == i20 || i17 == i20 || i18 == i20 || i19 == i20) continue;
                                                                                    pattern_count++;
                                                                                }
                                                                            }
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        console.log(i01 + ":" + i02 + ":" + i03 + ":" + i04 + ":" + i05 + ":" + i06 + ":" + i07 + ":" + i08 + ":" + i09 + ":" + i10 + ":" + i11 + ":" + i12 + ":" + i13 + ":" + i14 + ":" + i15 + ":" + i16 + ":" + i17 + ":" + i18 + ":" + i19 + ":" + i20);
                    }
                }
            }
        }
    }
}
console.log(new Date());
add_pattern();
console.log(pattern_count);
console.log(new Date());

                                // console.log(i01 + ":" + i02 + ":" + i03 + ":" + i04 + ":" + i05 + ":" + i06 + ":" + i07 + ":" + i08 + ":" + i09 + ":" + i10);
                                // pattern_count++

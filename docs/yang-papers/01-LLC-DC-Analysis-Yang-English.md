# LLC Resonant Converter DC Analysis
## Source: Bo Yang Ph.D. Dissertation (Appendix B)
## Extracted: DC Characteristic, FHA Simplified Model, Operating Modes


## Page 259

Bo Yang Chapter 7. Summary and future work
more stable compare with previous region. With load change, the change on small
signal characteristic is similar to those could be observed in PWM converter, split
of double pole could be observed. With information about small signal
characteristic of the converter, compensator could be designed.
With the knowledge from this work, LLC resonant converter could be
designed for given specifications. From the prototypes built in CPES, LLC
resonant converter shows great improvement in efficiency and power density.
Compare 200kHz switching frequency design, LLC resonant converter could
improve efficiency by more than 3%. Power density could be improved by almost
100%. With 400kHz design of LLC resonant converter, the power density could
be improved by more than 200% compare with asymmetrical half bridge
converter.
7.2 Future work
7.2.1 Passive integration for LLC resonant converter
Passive components are often the limitation on volume, and cost of the
system. For LLC resonant converter, with integrated magnetic technology, all
magnetic components could be integrated into single magnetic structure. With
planar magnetic, the resonant capacitors could also be integrated into magnetic
structure. This way, all the passive components except output cap could be
integrated. This integration will provide many benefits: high density, less
interconnection, better electric performance.
243

## Page 260

Bo Yang Chapter 7. Summary and future work
With passive integration, more complex resonant tank structure could be
constructed. With more complex structure, other benefits could be expected as
shown in Figure 7.1, Figure 7.2, and Figure 7.3. With another branch in resonant
tank, the primary RMS current could be reduced.
Figure 7.1 LLC resonant tank and LLC resonant tank with passive current shaping
Figure 7.2 Simulation waveform of LLC resonant converter
Figure 7.3 Simulation waveform of LLC resonant converter with passive current shaping
244

## Page 261

Bo Yang Chapter 7. Summary and future work
7.2.2 LLC resonant converter for other application
The most significant benefit of LLC resonant converter for front end DC/DC
application is that it could be optimized for high input voltage. In fact, other than
this, there are several other benefits. First, the voltage stress on the secondary
rectifier is minimized to two times output voltage only. Second, the output
rectifier commutates naturally, there is no reverse recovery problem. Third,
switching loss of LLC resonant converter could be minimized. Fourth, without
output filter inductor, the transient of LLC resonant converter could be very fast.
With all these advantages, LLC resonant converter is a possible candidate for
other applications like isolated point of load converter too.
Higher frequency operation of LLC resonant converter
With LLC resonant converter, switching loss could be minimized. By control
magnetizing inductance Lm, switching loss could also be controlled. This gave us
opportunity to push to higher switching frequency. For some state of the art
magnetic material, the optimal operating frequency could be as high as MHz.
LLC resonant converter enable us to utilize these new material in front end
application. The issue is how to trade off the design between magnetic loss,
volume and operating region of the system.
7.2.3 Small signal modeling of resonant converter
In this work, the small signal characteristic of LLC resonant converter is been
revealed. Still, a simple and easy to use model is not available yet, which is a
245

## Page 262

Bo Yang Chapter 7. Summary and future work
major obstacle for people to accept and appreciate this topology. With extended
describing function method, it is possible to get an equivalent small signal circuit
model when only first order harmonic of switching frequency is considered.
Unfortunately, third or even fifth harmonic are needed to model LLC resonant
converter. There is still need to develop method to derive simple circuit model for
this kind of topologies.
246

## Page 263

Bo Yang Appendix A. Two and Three Components Resonant Tanks
Appendix A.
Two and Three Components Resonant
Tanks
In this part, resonant tank with two and three resonant components will be
listed and classified. Since this is a complex task, several boundaries were set to
make it manageable.
First, assume variable frequency control is the control method going to be
used for these tanks,
Second, for the resonant tank, input and output source type will be determined
by tank configuration. For example, the output is must a current source for PRC
since the primary side is capacitor, although PRC with voltage source could also
work. This also means that there is no capacitor in parallel with input terminals
since input is assumed to be voltage source type. Different input and output type
is shown in Figure A.1 and Figure A.2.
247

## Page 264

Bo Yang Appendix A. Two and Three Components Resonant Tanks
Figure A.1 Input type for DC/DC converter
Figure A.2 Input type for DC/DC converter
Third, assume the input is voltage source; output could be voltage source or
current source.
A.1. Two resonant components resonant tank
For resonant tank with two resonant components, there are totally eight
different type of resonant tank configurations as shown in Figure A.3.
248

## Page 265

Bo Yang Appendix A. Two and Three Components Resonant Tanks
Figure A.3 Two components resonant tanks
In this family, tank A is for series resonant converter. Tank C is for parallel
resonant converter. Tank B is another form of parallel resonant converter. Tank E
and Tank G requires a current source input, which is not commonly used for this
application. Tank F could be used for voltage source input, but it is not
meaningful since it cannot regulate power transferred to the load but increase the
circulating energy. Tank H could also be applied to voltage source input, but then
it is no longer a resonant topology because the resonant inductor will be clamped
by input voltage source and never resonant with resonant capacitor. So for two
resonant components resonant tank, tank A, B, C and D will be useful.
The characteristics of these four resonant tanks are shown below. We can see
that tank B has very similar characteristic with tank C that is widely used as
parallel resonant converter.
249

## Page 266

Bo Yang Appendix A. Two and Three Components Resonant Tanks
Figure A.4 DC characteristic of two components tank A
Figure A.5 DC characteristic of two components tank B
250

## Page 267

Bo Yang Appendix A. Two and Three Components Resonant Tanks
Figure A.6 DC characteristic of two components tank C
Figure A.7 DC characteristic of two components tank D
251

## Page 268

Bo Yang Appendix A. Two and Three Components Resonant Tanks
A.2. Three resonant components resonant tank
There are many possibilities for three components resonant tank. In this part,
they will be listed and classified.
With three components, there are seventeen ways to connect them as shown in
Figure A.8.
Figure A.8 Components configuration for three components resonant tank
With in these seventeen configurations, 15, 16 and 17 will result to a reduced
order since two components could be replaced with one. For the other 14
configurations, with different resonant components, different resonant tank could
be constructed. Since we are looking at three components resonant tank, the
possible components used could be two Ls and one C or two Cs and one L. Three
Ls or three Cs will not result to three components resonant tank and will be
eliminated. With fourteen different configurations, there are 36 different resonant
tanks as shown below.
252

## Page 269

Bo Yang Appendix A. Two and Three Components Resonant Tanks
Figure A.9. Resonant tank for components configuration 1
Figure A.10. Resonant tank for components configuration 2
Figure A.11. Resonant tank for components configuration 3
253

## Page 270

Bo Yang Appendix A. Two and Three Components Resonant Tanks
Figure A.12. Resonant tank for components configuration 4
Figure A.13. Resonant tank for components configuration 5
Figure A.14. Resonant tank for components configuration 6
254

## Page 271

Bo Yang Appendix A. Two and Three Components Resonant Tanks
Figure A.15. Resonant tank for components configuration 7
Figure A.16. Resonant tank for components configuration 8
Figure A.17. Resonant tank for components configuration 9
255

## Page 272

Bo Yang Appendix A. Two and Three Components Resonant Tanks
Figure A.18. Resonant tank for components configuration 10
Figure A.19. Resonant tank for components configuration 11
256

## Page 273

Bo Yang Appendix A. Two and Three Components Resonant Tanks
Figure A.20. Resonant tank for components configuration 12
Figure A.21. Resonant tank for components configuration 13
257

## Page 274

Bo Yang Appendix A. Two and Three Components Resonant Tanks
Figure A.22. Resonant tank for components configuration 15
These 36 resonant tanks could be classified in following table. They are
classified according to the input source type and output type. For example, for
resonant tank A, the input and output are directly connected, so the input and
output have to be different type. In the table, it will be list as ITV or VTI, which
means the input is current source and output is voltage source or vice versa.
Another example is tank Y, since the input of the tank is capacitive, so input has
to be current source. The output of the tank is an inductor, so output has to be
voltage source. So tank Y could only be applied to ITV.
For these 36 resonant tanks, there are 23 could be used for voltage source
input. Next we will continue eliminate some of them. For some resonant tank
here, it could not be used to regulate the output. For example, tank A could be
used for VTI configuration. Since the resonant components is in parallel with the
input, they cannot affect the power transferred to output, which means with this
resonant tank, the output could not be regulated with variable frequency control.
258

## Page 275

Bo Yang Appendix A. Two and Three Components Resonant Tanks
For some other resonant tanks, with voltage source configuration, one or more of
the resonant components will not participate in controlling output power. For
example, in tank I, the series resonant branch is in parallel with input. The current
through this branch will not have effect on output power. So it will not behave as
three components resonant converter anymore.
Table A-1 Classification of three components resonant tanks
Tank VTV VTI ITV ITI Topo VTV VTI ITV ITI Topo
A V I 1 S V I 10
B I I 1 T I I 10
C V 2 U V 11
D V I 2 V V I 11
E V 3 W V 11
F I 3 X V I 11
G V 4 Y 11
H V 4 Z V 11
I V 5 A1 V 12
J V I 5 B1 I 12
K V 6 C1 V 12
L V I 6 D1 I 12
M V I 7 E1 I 12
N I I 7 F1 I I 12
O V I 8 G1 V I 13
P I I 8 H1 V I I 13
Q I 9 I1 V I 14
R I I 9 J1 I I 14
Total 9 14 23 9
Base on above rules, tank A, E, I, J, M, A1, C1 and I1 will be eliminated. So
the resonant tank could be used for voltage source input are listed as following:
259

## Page 276

Bo Yang Appendix A. Two and Three Components Resonant Tanks
Table A-2 Three components resonant tanks with voltage source input
Tank VTV VTI Topo
C V 2
D V 2
G V 4
H V 4
K V 6
L V 6
O V 8
S V 10
U V 11
V V 11
W V 11
X V 11
Z V 11
G1 V 13
H1 V 13
6 9
Next the DC characteristic of each resonant tank will be derived.
Figure A.23. DC characteristic of tank C
260

## Page 277

Bo Yang Appendix A. Two and Three Components Resonant Tanks
Figure A.24. DC characteristic of tank D
Figure A.25. DC characteristic of tank G
261

## Page 278

Bo Yang Appendix A. Two and Three Components Resonant Tanks
Figure A.26. DC characteristic of tank H
Figure A.27. DC characteristic of tank K
262

## Page 279

Bo Yang Appendix A. Two and Three Components Resonant Tanks
Figure A.28. DC characteristic of tank L
Figure A.29. DC characteristic of tank O
263

## Page 280

Bo Yang Appendix A. Two and Three Components Resonant Tanks
Figure A.30. DC characteristic of tank S
Figure A.31. DC characteristic of tank U
264

## Page 281

Bo Yang Appendix A. Two and Three Components Resonant Tanks
Figure A.32. DC characteristic of tank V
Figure A.33. DC characteristic of tank W
265

## Page 282

Bo Yang Appendix A. Two and Three Components Resonant Tanks
Figure A.34. DC characteristic of tank X
Figure A.35. DC characteristic of tank Z
266

## Page 283

Bo Yang Appendix A. Two and Three Components Resonant Tanks
Figure A.36. DC characteristic of tank G1
Figure A.37. DC characteristic of tank H1
267

## Page 284

Bo Yang Appendix A. Two and Three Components Resonant Tanks
In above resonant tanks, tank H, X and Z have similar characteristic as
traditional called LCC resonant converter. For resonant tank G, U and W, they
have the characteristic of LLC resonant converter.
268

## Page 285

Bo Yang Appendix B. Operation modes of LLC resonant converter
Appendix B.
Operation modes and DC analysis of LLC
resonant converter
In this part, different operation modes of LLC resonant converter will be
discussed.
LLC resonant converter, as a three resonant components resonant converter,
has many different operating modes. It is a multi resonant converter. During one
switching cycle, the resonant tank configuration changes. With different load
condition, discontinuous conduction mode could happen. In this part, different
operating modes in different operating region and load condition will be listed.
From the DC characteristic of LLC resonant converter, the operating of LLC
resonant converter could be divided into three regions as shown in Figure B.1. As
discussed in chapter 3, region 1 and region 2 are ZVS regions, which are preferred
for high frequency operation. In region 3, the converter is working under ZCS.
For this converter, preferred operating regions are region 1 and region 2 in order
to achieve ZVS.
269

## Page 286

Bo Yang Appendix B. Operation modes of LLC resonant converter
Figure B.1 DC characteristic of LLC resonant converter
B.1. Operating modes of LLC resonant converter in Region 1
In region 1, the converter works very similar as a SRC. But because of the
impact of Lm, there are some new operation modes for LLC resonant converter.
In this region, there are three different operating modes as load changes.
Operating mode 1 in region 1
This mode of operation is same as a SRC. Resonant components Lr and Cr act
as the series resonant tank. During whole switching cycle, Lm is clamped by
output voltage and never participates in the resonant process. This mode also
could be called as continuous conduction mode since the output current is always
continuous.
In this operation mode, Lm just acts as a passive load of series resonant tank
of Lr and Cr. The operating waveforms are shown in Figure B.2.
270

## Page 287

Bo Yang Appendix B. Operation modes of LLC resonant converter
Figure B.2 Waveform of operation mode 1 in region 1 for LLC resonant converter'
271

## Page 288

Bo Yang Appendix B. Operation modes of LLC resonant converter
Operating mode 2 in region 1
As load becomes lighter, the converter will work into mode 2. The different of
mode 2 and mode 1 is that after primary switches been switched, there will have a
time period during which the secondary current is zero, or discontinuous
conduction mode. During this dead time, primary current is clamped to the Lm
current, the resonant tank will be consisted with Cr and Lm in series with Lr.
This mode happens when following condition is met:
Lm
(V +V )⋅ <Vo⋅n
IN Cr Lm+Lr
When above condition is met, when primary switches switched, the voltage
apply to the Lm is the left of above equation. If this voltage is lower than the
output voltage reflected to the primary side, the output diodes would not conduct,
only after Lm current continuous charge Cr so that above condition is broken, the
output filter diodes begin to conduct. Then Lm will be clamped to output voltage
and no longer resonant with Cr.
During this mode, Lm not only acts as the load of SRC, it also participate in
the resonant with Cr. For SRC, there is no DCM in this region.
The operating waveforms are shown in Figure B.3. Because of existence of
Lm, there are more circulating current for LLC at light load compared with SRC.
But the benefit is ZVS is ensured at light load condition.
272
## Page 260

Bo Yang Chapter 7. Summary and future work
With passive integration, more complex resonant tank structure could be
constructed. With more complex structure, other benefits could be expected as
shown in Figure 7.1, Figure 7.2, and Figure 7.3. With another branch in resonant
tank, the primary RMS current could be reduced.
Figure 7.1 LLC resonant tank and LLC resonant tank with passive current shaping
Figure 7.2 Simulation waveform of LLC resonant converter
Figure 7.3 Simulation waveform of LLC resonant converter with passive current shaping
244

## Page 261

Bo Yang Chapter 7. Summary and future work
7.2.2 LLC resonant converter for other application
The most significant benefit of LLC resonant converter for front end DC/DC
application is that it could be optimized for high input voltage. In fact, other than
this, there are several other benefits. First, the voltage stress on the secondary
rectifier is minimized to two times output voltage only. Second, the output
rectifier commutates naturally, there is no reverse recovery problem. Third,
switching loss of LLC resonant converter could be minimized. Fourth, without
output filter inductor, the transient of LLC resonant converter could be very fast.
With all these advantages, LLC resonant converter is a possible candidate for
other applications like isolated point of load converter too.
Higher frequency operation of LLC resonant converter
With LLC resonant converter, switching loss could be minimized. By control
magnetizing inductance Lm, switching loss could also be controlled. This gave us
opportunity to push to higher switching frequency. For some state of the art
magnetic material, the optimal operating frequency could be as high as MHz.
LLC resonant converter enable us to utilize these new material in front end
application. The issue is how to trade off the design between magnetic loss,
volume and operating region of the system.
7.2.3 Small signal modeling of resonant converter
In this work, the small signal characteristic of LLC resonant converter is been
revealed. Still, a simple and easy to use model is not available yet, which is a
245

## Page 262

Bo Yang Chapter 7. Summary and future work
major obstacle for people to accept and appreciate this topology. With extended
describing function method, it is possible to get an equivalent small signal circuit
model when only first order harmonic of switching frequency is considered.
Unfortunately, third or even fifth harmonic are needed to model LLC resonant
converter. There is still need to develop method to derive simple circuit model for
this kind of topologies.
246

## Page 263

Bo Yang Appendix A. Two and Three Components Resonant Tanks
Appendix A.
Two and Three Components Resonant
Tanks
In this part, resonant tank with two and three resonant components will be
listed and classified. Since this is a complex task, several boundaries were set to
make it manageable.
First, assume variable frequency control is the control method going to be
used for these tanks,
Second, for the resonant tank, input and output source type will be determined
by tank configuration. For example, the output is must a current source for PRC
since the primary side is capacitor, although PRC with voltage source could also
work. This also means that there is no capacitor in parallel with input terminals
since input is assumed to be voltage source type. Different input and output type
is shown in Figure A.1 and Figure A.2.
247

## Page 264

Bo Yang Appendix A. Two and Three Components Resonant Tanks
Figure A.1 Input type for DC/DC converter
Figure A.2 Input type for DC/DC converter
Third, assume the input is voltage source; output could be voltage source or
current source.
A.1. Two resonant components resonant tank
For resonant tank with two resonant components, there are totally eight
different type of resonant tank configurations as shown in Figure A.3.
248

## Page 265

Bo Yang Appendix A. Two and Three Components Resonant Tanks
Figure A.3 Two components resonant tanks
In this family, tank A is for series resonant converter. Tank C is for parallel
resonant converter. Tank B is another form of parallel resonant converter. Tank E
and Tank G requires a current source input, which is not commonly used for this
application. Tank F could be used for voltage source input, but it is not
meaningful since it cannot regulate power transferred to the load but increase the
circulating energy. Tank H could also be applied to voltage source input, but then
it is no longer a resonant topology because the resonant inductor will be clamped
by input voltage source and never resonant with resonant capacitor. So for two
resonant components resonant tank, tank A, B, C and D will be useful.
The characteristics of these four resonant tanks are shown below. We can see
that tank B has very similar characteristic with tank C that is widely used as
parallel resonant converter.
249

## Page 266

Bo Yang Appendix A. Two and Three Components Resonant Tanks
Figure A.4 DC characteristic of two components tank A
Figure A.5 DC characteristic of two components tank B
250

## Page 267

Bo Yang Appendix A. Two and Three Components Resonant Tanks
Figure A.6 DC characteristic of two components tank C
Figure A.7 DC characteristic of two components tank D
251

## Page 268

Bo Yang Appendix A. Two and Three Components Resonant Tanks
A.2. Three resonant components resonant tank
There are many possibilities for three components resonant tank. In this part,
they will be listed and classified.
With three components, there are seventeen ways to connect them as shown in
Figure A.8.
Figure A.8 Components configuration for three components resonant tank
With in these seventeen configurations, 15, 16 and 17 will result to a reduced
order since two components could be replaced with one. For the other 14
configurations, with different resonant components, different resonant tank could
be constructed. Since we are looking at three components resonant tank, the
possible components used could be two Ls and one C or two Cs and one L. Three
Ls or three Cs will not result to three components resonant tank and will be
eliminated. With fourteen different configurations, there are 36 different resonant
tanks as shown below.
252

## Page 301

Bo Yang Appendix B. Operation modes of LLC resonant converter
With this simplified circuit model, the DC characteristic could be get as:
Vo j⋅ω⋅Q
= n l
Vin 1 8
j⋅ω(Q +1− )+Q (1−ω2)Q ⋅
n l ω2 l n s π2
n
ω : Normalized switching frequency
n
Lr
Zo:
Cr
Lm
Q: : Ratio of two resonant inductance
l Lr
8
R : Equivalent Load Resistance Ro⋅n2
AC π2
Zo
Q:
s Ro
For this method, there are some limitations. Because this method is a
simplified method, error will be generated with different operating point. When
the current waveform is not sinusoidal and contains more high order harmonic,
this method will generate high error. To evaluate this error, a more accurate DC
characteristic is needed. Here simulation is used to derive the accurate DC gain
characteristic. A time domain switch circuit model is built in simulation software.
By changing the switching frequency and load condition, a output voltage can be
get for each point. Sweep load and switching frequency, an accurate DC
characteristic is got. The results of these two methods are shown in following
figures. And the error is also shown.
285

## Page 302

Bo Yang Appendix B. Operation modes of LLC resonant converter
Figure B.10 DC characteristic from simplified model
Figure B.11 DC characteristic from simulation method
286

## Page 303

Bo Yang Appendix B. Operation modes of LLC resonant converter
Figure B.12 Error of simplified circuit model
From the error it can be seen that, when the switching frequency equals to the
resonant frequency, there is no error. When the switching frequency is moving
away from resonant frequency, the error will be high. This can be understood
from waveform also; when the circuit works at resonant frequency, the current
waveform is exactly sinusoidal, so simplified model doesn't have any error. When
switching frequency is away from resonant frequency, high order harmonic
content will increase, which will affect the accuracy of the simplified model.
For the design of LLC resonant converter, the trade offs are more affected by
operating point with maximum gain. With simplified model, large error will be
introduced. Simulation gives accurate results; the issue is that it is time
consuming. A better method is to combine these two methods. During primary
287

## Page 304

Bo Yang Appendix B. Operation modes of LLC resonant converter
design, use simplified model to get a range. To optimize the design, simulation
method is preferred to get a better design.
288

## Page 305

Bo Yang Appendix C. Small signal characteristic of SRC converter
Appendix C.
Small signal characteristic of SRC
converter
C.1. Small signal characteristic of SRC
The circuit parameters for SRC used in the simulation are shown in Figure
C.1. The small signal characteristic get from simulation are shown in Figure C.2.
Figure C.1 SRC circuit for small signal analysis
In the graph, the x-axis is the frequency of the perturbation signal as in bode
plot; y-axis is the magnitude in DB or phase in degree, and z-axis is the running
parameter, which is the switching frequency. This is because for resonant
converter, to regulate the output voltage, the switching frequency will be varied.
For different switching frequency, the small signal model will be different. From
these results, following things can be clearly identified:
289

## Page 306

Bo Yang Appendix C. Small signal characteristic of SRC converter
1. Beat frequency double pole. This is a special characteristic for resonant
converter [5][6]. As switching frequency changes, a double pole with frequency
at the difference of switching frequency and resonant frequency will move
accordingly too. Finally, when switching frequency is close enough to resonant
converter, this double pole will split, one merge with low frequency pole formed
by output cap and load, one move to higher frequency.
Figure C.2 Bode plot of control to output transfer function of Series Resonant Converter
290

## Page 307

Bo Yang Appendix C. Small signal characteristic of SRC converter
2. Beat frequency dynamic. Since the low frequency gain is proportional to
the slope of DC characteristic of series resonant converter. When the operation
frequency moves close to the resonant frequency, the slope gets flat and low
frequency gain drops. When switching frequency equals to resonant frequency,
the gain will be zero. As can be clearly seen on the graph, when switching
frequency is close to resonant frequency, the control to output gain will be very
low. A gap can be observed on the graph.
3. The phase has a 180-degree jump around resonant frequency. This is
because of the change of the DC characteristic slope. Switching frequency lower
than resonant frequency, with increasing switching frequency, gain will
increase, so the phase delay at DC will be zero. When the switching frequency is
higher than resonant frequency, as switching frequency increases, gain will
decrease, which will give 180 degree at DC.
4. Low frequency pole, which is caused by the output capacitor and load.
With lighter load, this pole will move to lower frequency.
There should have an ESR zero if ESR of the output capacitor is considered.
Here in this simulation, ESR is neglected.
From above simulation results, the small signal characteristic of a series
resonant converter is derived. Beat frequency double pole and beat frequency
dynamic are observed. Compare with results reported in [6], a very good match is
achieved. From this result, we can be more confident with the method. These
291

## Page 308

Bo Yang Appendix C. Small signal characteristic of SRC converter
results also will be used as a reference to compare with LLC resonant converter
since it is very similar to SRC in some operating region.
292

## Page 309

Bo Yang Appendix D. LLC resonant converter model for extended describing function analysis
Appendix D.
LLC converter model for EDF analysis
In this part, the model file and software package for extended describing
function analysis will be listed. This software is written in MATLAB. This
appendix is divided into two parts. First part is the process for building the model
file for extended describing function analysis. In the second part, the LLC model
file for extended describing function analysis at listed. The software package for
extended describing function could be found in dissertation of Dr. Eric X. Yang.
The version used for the analysis is MATLAB 5.0.
D.1. Process of building LLC circuit model for EDF analysis
To build the model of the converter for describing function analysis, first the
operation of the converter need to be understood clearly. The operating stages in
each switching cycle need to be identified. For each operating stage, the state
space needs to be derived. Base on this information, the model file could be build.
In this part, the operating modes of LLC converter at full load condition will
be analyzed in region 1 and region 2. Region 3 is eliminated because of ZCS
operation. At light load condition, the converter might run into DCM. Since DCM
293

## Page 310

Bo Yang Appendix D. LLC resonant converter model for extended describing function analysis
operation will introduce many more operating modes, it is not included in this
model. The circuit and notifications are shown in Figure D.1.
Figure D.1 Circuit diagram and notification for extended describing function analysis
In this circuit, there are four passive components: Lr, Cr, Lm and Co. Four
states could be chosen for each components as: I , I , V , and V . But look at
Lr Lm Cr Co
the topology; the current through output is the difference of two states, I and I .
Lr Lm
Also, the converter changes stage if I -I changes sign as will shown later. For
Lr Lm
simplification, the states were chosen as: I -I , I , V , and V . As shown in
Lr Lm Lm Cr Co
the circuit, the input variables are Vin and Io. The output variables are Iin and Vo.
With these variables the state equations in each region could be derived in the
form of:
x& = Ax+Bu
y =Cx+Du
294

## Page 311

Bo Yang Appendix D. LLC resonant converter model for extended describing function analysis
( )′
x = i −i i v v
Lr Lm Lm Cr Cf
( )′
where u = v i .
in o
( )′
y = v i
o in
D.1.1. Model of LLC resonant converter in region 1
The simulation waveforms of LLC resonant converter in region 1 are shown
in Figure D.2. The operation in this region could be divided into 4 different modes
as shown in the diagram. The simplified topology in each mode and the condition
for transferring from one mode to next mode is shown in Figure D.3.
Figure D.2 Simulation waveform of LLC converter in region 1
295
# Snakes and Ladders
Visual implementation of the classical Snakes and Ladders quiz. Playground is a field of 100 enumerated cells.
In one move player can make from 1 to 6 steps (cells).
Playground may also contain a number of ladders (that let player climb forward) and snakes (that in contrary return them back).
The task is to go from #1 to #100 in as less steps as possible.

## Interface
Current implementation is fed by 3 lines of data:
1. ```%ladders#%,%snakes#%```
2. ```%ladder1_from%,%ladder1_to% %ladder2_from%,%ladder2_to% ...```
3. ```%snake1_from%,%snake1_to% %snake2_from%,%snake2_to% ...```

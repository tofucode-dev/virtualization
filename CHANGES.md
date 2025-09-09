# NOTES

- Application is a React Virtualization demo
- User can specify virutalizer props: 
    num of rows, 
    num of columns, 
    row height, 
    column width, 
    container height, 
    container width

Virtualizer should be able to:
     - display virtualized big grids (i.e. 50k x 50k) in specified container, 
     - React to user inputs, 
     - It should be a reusable component with customizable children render function.
     - Optimized performance by using useMemo, reactMemo etc.

# Virtualizer Adjustmets Changelog

## CRITICAL FIXES (Must Fix First)

1. The grid is not shwon in the container - Wrong CSS positioning: Using "fixed" instead of "absolute" breaks layout
2. rowHeight / rowWidth is defined as `number` or `(index: number) => number` it is causing typescript errors in onScroll callback. 
    - handle prop as a function by using avg value (for now just calucalte them in onScroll using already existing totalHeight/width) 
      Possible improvements
      - Move avg calculation to useMemo value
      - handle division by 0 issues
3. There are missing dependecies in onScroll callback function causing lack of updates when values from user input change
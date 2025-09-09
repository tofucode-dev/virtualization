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

# Virtualizer Adjustmets Changelog

## CRITICAL FIXES (Must Fix First)

- The grid is not shwon in the container - Wrong CSS positioning: Using "fixed" instead of "absolute" breaks layout
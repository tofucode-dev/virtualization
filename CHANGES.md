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
3. There are missing dependecies in onScroll callback function causing lack of updates when values from user input change.
4. Missing initial state: Visible range starts at 0 instead of calculated values

## TYPESCRIPT IMPROVEMENTS

1. Missing interfaces: No VirtualizerProps, CellInfo, SizeFunction interfaces
2. Utility functions are missing proper typing
3. Number checks are missing !isNaN and isFinite


## CODE QUALITY & READABILITY

1. Some of the functions could be extracted and be more generic
2. render function inside component template is causing lack of readability
3. Virtualizer has a lot of utils functions and state management. For better readability, maintanance, separation of concerns, testing it would be better to split component into smaller pieces, hooks i.e
```
src/
├── component-library/
│   ├── Virtualizer/
│   │   ├── index.ts       
│   │   └── Virtualizer.tsx
│   └── index.ts           
├── hooks/
│   └── useVirtualizer.ts
├── types/
│   └── virtualizer.types.ts
└── utils/
    └── virtualizer-utils.ts
```
4. Split use-virtualization into more - granual single responsibility hooks

## PERFORMANCE OPTIMIZATIONS

1. I try not to create premature optimization. No need for useMemo or useCallback if calculations are not complex.
2. renderCell function is creating nested array [[], [], []] in the end React will need to flatten this array so it is better to use flat array to render. Also there is no need to create temporary array and fill with nulls and then map.
3. React.memo in that case is unnecessary because rerendering is driven by parent the render function will change on every parent rerender causing rerender of Virtualizer
    - we can create render function as a useCallback in parent or write comparation function in React.memo to exclude checks for children
    - When checked in React DevTools Profiler rerenders in App.tsx are causing rerenders in Virtualizer because of `children` change.
4. Just in case, because of big numbers like 50k, 100k rows/cols it would be good to memonize all calculated values. Although it might be a premature optimazation


## POSSIBLE IMPROVEMENTS

1. Add Error boundries
2. Handle Extreme values Edge cases
3. (perf) Replace styled components with somethin tailwind based like shadcn/radixui for better performance since styled components is not staticly generated

## POSSIBLE PROBLEMS

1. For dynamic row/col size usinng average size to calculate visible elements can be inaccurate expecialy when there is a high variance i.e [10, 200,  15, 300, 20]. 
2. For current implementation there is an issue with max browser rendering dimensions. If you provide huge numbers, browser wont be able to render them and will stop in somepoint i.e 32M px for Chrome. The issue is in:

```
<div
        style={{
          position: "relative",
          height: totalHeight,
          width: totalWidth,
          overflow: "hidden",
        }}
      >
...      
```

Possible fix is to change logic to that container. Instead of using set height and width keep the size as max and generate content inside relative to the actual values / container viewport. 
It will take some time to think through and implement so im keeping the current solution with viewport relative content 

## Missing features

1. ~~**No Overscan**: No buffer rows/columns for smoother scrolling~~
2. **No Loading States**: No handling for dynamic content loading great with a small debounce of on scroll event. 
3. **Metrics**: For debuging puproses it would be good to see metrics of number of rendered cells / time it took to render cell etc.
4. **Unit Tests**: Add Unit tests for most important features 

## Logic fixes

1. There was an issue where after updating row/col number value the scroll was not adjusting its position. 
2. Cell definition in App.tsx is using forwardRef while it is not actually used since Cell is just a div.
# External Code Review Analyzer

Analyzes external code review feedback point-by-point, providing agreement assessment with motivation and detailed action plans for accepted points.

## Usage

`/external-code-review "review text"`

### Examples

```
/external-code-review "The timer component re-renders too often. The NoiseMeter lacks error boundaries. The audio service should cache decoded buffers."

/external-code-review "Fix the separation rules algorithm - it's O(n³). Add input validation to CSV parser. Consider splitting Semaphore component - it's doing too much."
```

---

## How It Works

### Step 1: Parse Input
- Accepts review text as inline parameter
- Identifies individual feedback points/issues
- Groups related concerns

### Step 2: Analyze Each Point
For every point in the review, I assess:

1. **Agreement Status**: ✅ Agree / ⚠️ Partially / ❌ Disagree
2. **Motivation**: Detailed reasoning for my stance
3. **Confidence**: How certain am I in this assessment
4. **Context**: Relevant code references if applicable

### Step 3: Propose Action Plans
For each point I **agree with**:
- **What**: Specific changes needed
- **Where**: Affected files and components
- **How**: Implementation approach
- **Effort**: Estimated complexity/time
- **Dependencies**: Prerequisites or blockers

### Step 4: Summary Report
```
## 📋 External Review Analysis

### Review Points Assessment
Each point with: [Status] [Motivation] [Confidence]

### Accepted Action Plans
Detailed plans for all agreed-upon points

### Points of Disagreement
Why certain points are disputed

### Implementation Ready
- All action plans documented
- Ready for explicit implementation request
```

---

## Important Notes

✋ **No Implementation Yet**
- This command analyzes and plans only
- Waits for explicit user request to execute changes
- Gives you time to review and discuss the analysis

📋 **Comprehensive Assessment**
- Each point evaluated independently
- Clear reasoning for acceptance/rejection
- Action plans detailed and actionable

🎯 **Next Steps After Review**
Once you approve the analysis, you can:
1. Request implementation of specific action plans
2. Discuss disagreements or refinements
3. Ask for clarification on any assessment
4. Iterate on the approach before coding

---

## What Happens After

After I provide the analysis, you can:
- ✅ **Accept a plan**: "Implement the timer refactoring plan"
- 🤔 **Discuss a point**: "Why do you disagree with the error boundary change?"
- 📝 **Refine a plan**: "Let's adjust the action plan for the audio service"
- ❌ **Reject feedback**: "I don't agree with that assessment, here's why..."
- 🚀 **Execute all**: "Implement all accepted action plans"

---

## Example Analysis Output

```
## 📋 External Review Analysis

### Review Point 1: "Timer re-renders too often"

**Status**: ✅ AGREE
**Motivation**: useTimer hook lacks dependency array optimization.
Updating every render cycle instead of only when needed.
React DevTools Profiler would show unnecessary re-renders on parent updates.
**Confidence**: High (95%)
**Reference**: src/hooks/useTimer.ts:42-58

#### Action Plan
- **What**: Add useMemo and useCallback optimizations to useTimer
- **Where**: src/hooks/useTimer.ts, src/components/Timer/TimerView.tsx
- **How**:
  1. Wrap expensive calculations in useMemo
  2. Memoize callback functions with useCallback
  3. Verify with React DevTools Profiler
- **Effort**: 30 minutes
- **Dependencies**: None
---

### Review Point 2: "NoiseMeter lacks error boundaries"

**Status**: ✅ AGREE
**Motivation**: Error boundaries protect app from component crashes.
NoiseMeter accesses microphone APIs which can fail. Without boundary,
crashes propagate to parent and may crash entire app.
**Confidence**: High (90%)
**Reference**: src/components/NoiseMeter/

#### Action Plan
- **What**: Create ErrorBoundary wrapper for NoiseMeter component
- **Where**: src/components/NoiseMeter/NoiseMeterErrorBoundary.tsx (new file)
- **How**:
  1. Create ErrorBoundary component following React patterns
  2. Wrap NoiseMeter with error boundary
  3. Add fallback UI for error state
  4. Add test for error scenarios
- **Effort**: 45 minutes
- **Dependencies**: Needs React error boundary pattern knowledge
---

### Review Point 3: "Cache decoded audio buffers"

**Status**: ⚠️ PARTIALLY AGREE
**Motivation**: Caching would help with repeated plays of same audio.
However, need to assess current bottleneck first - is decoding actually
the performance problem or is it something else? Memory usage concern
if caching too many buffers.
**Confidence**: Medium (65%)
**Reference**: src/services/audioService.ts

#### Action Plan (if accepted)
- **What**: Implement audio buffer cache with LRU eviction
- **Where**: src/services/audioService.ts
- **How**:
  1. Profile current audio loading performance
  2. Create Map-based buffer cache
  3. Add LRU eviction policy (keep 10 buffers max)
  4. Benchmark before/after
- **Effort**: 1-2 hours
- **Dependencies**: Profiling data needed first
---

## Implementation Summary

**Points Accepted**: 2 fully, 1 partial
**Action Plans Ready**: 3
**Estimated Total Effort**: ~2 hours
**Ready to Implement**: Waiting for explicit request
```

---

## Tips for Best Results

1. **Be specific** - Detailed review points get better analysis
2. **Include context** - Mention affected components or user scenarios
3. **Reference code** - Point to specific files for faster assessment
4. **Explain reasoning** - Help me understand why you/reviewer care about a point
5. **Group related items** - Keep related points together for context

---

**Output**: Detailed point-by-point analysis with clear agreement assessment, reasoning, and action plans for all accepted feedback.

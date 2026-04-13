# Backend Error Handling & Toast Notifications

Centralized system for displaying user-friendly error messages when backend functions fail.

## Overview

The `useBackendFunctionError` hook and `invokeWithErrorHandling` utility provide automatic error handling with toast notifications for:
- HTTP 400/422 errors (validation/bad request)
- HTTP 401/403 errors (authentication/authorization)
- HTTP 404 errors (not found)
- HTTP 500+ errors (server errors)
- Network errors and timeouts

## Usage

### Option 1: Hook (Recommended for Components)

```jsx
import { useBackendFunctionError } from '@/hooks/useBackendFunctionError';

export default function MyComponent() {
  const invoke = useBackendFunctionError();

  const handleSubmit = async () => {
    try {
      const result = await invoke('myFunction', { foo: 'bar' }, {
        showSuccessToast: true,
        successMessage: 'Data saved successfully!',
        errorTitle: 'Failed to save data'
      });
      // Use result...
    } catch (error) {
      // Error already displayed as toast
    }
  };

  return <button onClick={handleSubmit}>Submit</button>;
}
```

### Option 2: Utility Function (For Module-Level Code)

```javascript
import { invokeWithErrorHandling } from '@/hooks/useBackendFunctionError';

// In event handlers, module code, etc.
async function someAsyncFunction() {
  const result = await invokeWithErrorHandling('myFunction', { data: 'value' }, {
    showSuccessToast: true,
    successMessage: 'Operation completed!'
  });
  return result;
}
```

### Option 3: Async Operation Component (Render Prop)

```jsx
import AsyncOperation from '@/components/ErrorBoundaryToast';

export default function MyComponent() {
  return (
    <AsyncOperation
      fn={async () => {
        const response = await base44.functions.invoke('myFunction', {});
        return response;
      }}
      onSuccess={(result) => console.log('Success:', result)}
      showSuccessToast={true}
      successMessage="Data loaded!"
      errorTitle="Failed to load data"
    >
      {(execute) => (
        <button onClick={() => execute()}>Load Data</button>
      )}
    </AsyncOperation>
  );
}
```

## Options

All error handling methods accept an `options` object:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `showSuccessToast` | boolean | false | Show toast on success |
| `successMessage` | string | 'Operation completed successfully' | Success toast message |
| `errorTitle` | string | 'Error' | Toast title for errors |
| `onSuccess` | function | undefined | Callback on success |
| `onError` | function | undefined | Callback on error |

## Error Message Mapping

Status codes are automatically mapped to user-friendly messages:

- **400/422**: "Invalid request. Please check your input and try again."
- **401**: "You are not authorized to perform this action."
- **403**: "You do not have permission to perform this action."
- **404**: "The requested resource was not found."
- **409**: "This resource already exists or there is a conflict."
- **429**: "Too many requests. Please try again later."
- **500+**: "Server error occurred. Please try again later."

Custom messages from the backend (via `response.data.message` or `response.data.error`) override defaults.

## Real-World Examples

### Example 1: Form Submission

```jsx
import { useBackendFunctionError } from '@/hooks/useBackendFunctionError';
import { Button } from '@/components/ui/button';

export default function UserForm() {
  const invoke = useBackendFunctionError();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData) => {
    setLoading(true);
    try {
      await invoke('createUser', { ...formData }, {
        showSuccessToast: true,
        successMessage: 'User created successfully!'
      });
      // Form cleared, etc.
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      handleSubmit(new FormData(e.target));
    }}>
      {/* form fields */}
      <Button disabled={loading}>Submit</Button>
    </form>
  );
}
```

### Example 2: Data Fetch with Loading

```jsx
import { useBackendFunctionError } from '@/hooks/useBackendFunctionError';
import { useEffect, useState } from 'react';

export default function DataList() {
  const invoke = useBackendFunctionError();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const result = await invoke('fetchItems', {}, {
          errorTitle: 'Failed to load items'
        });
        setData(result.items || []);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [invoke]);

  if (loading) return <div>Loading...</div>;
  return <div>{data.map(item => <div key={item.id}>{item.name}</div>)}</div>;
}
```

### Example 3: Handling Specific Errors

```jsx
const invoke = useBackendFunctionError();

await invoke('paymentFunction', { amount: 100 }, {
  onError: (error) => {
    if (error.status === 402) {
      // Insufficient funds - trigger payment method selection
      openPaymentModal();
    } else if (error.status === 409) {
      // Duplicate transaction - retry with new ID
      retryWithNewId();
    }
  }
});
```

## Tips

1. **Always show feedback**: Use `showSuccessToast: true` for user actions (saves, deletes, etc.)
2. **Meaningful titles**: Customize `errorTitle` to match the action (e.g., "Failed to save property")
3. **Avoid duplicate error handling**: Don't wrap with try/catch unless you need custom logic
4. **Re-throw when needed**: Errors are re-thrown so parent components can handle them if needed
5. **Use for all backend calls**: Replace direct `base44.functions.invoke` with this system app-wide

## Migration

Replace existing code:

```javascript
// Old (silent failures)
const result = await base44.functions.invoke('myFunc', data);

// New (with error handling)
const invoke = useBackendFunctionError();
const result = await invoke('myFunc', data);
``
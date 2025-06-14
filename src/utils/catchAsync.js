
function catchAsync(fn) {
  return (call, callback) => {
    fn(call, callback).catch((error) => {
      console.error(error)
      callback({
        code: error?.code || 13,
        message: error?.message || 'Internal server error',
      })
    })
  }
}

export default catchAsync;

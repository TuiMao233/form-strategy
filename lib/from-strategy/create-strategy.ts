/*
 * @Author: Mr.Mao
 * @Date: 2021-01-07 10:12:16
 * @LastEditTime: 2021-04-29 11:24:13
 * @Description: 
 * @LastEditors: Mr.Mao
 * @autograph: 任何一个傻子都能写出让电脑能懂的代码，而只有好的程序员可以写出让人能看懂的代码
 */
import { ValidateOptions, ValidateResult } from "../from-types"
export type SetErrorHandleCallBackType = (resulrt:ValidateResult, params: any) => void
import email from "../rules/email";
import empty from "../rules/empty";


export default <T extends ValidateOptions<string> = {}>(validateContainer = {} as T) => {
  type Types = "empty" | "email" | keyof T;
  // 合并默认配置
  const newValidateContainer = Object.assign(
    { empty, email },
    validateContainer
  );
  const errorHandleModular = {
    errorHandle: (() => {}) as SetErrorHandleCallBackType
  }
  // 单验证方法
  const validate = (type: Types, value: any, name?: string, params?: any,) => {
    const validateMethod = newValidateContainer[type]
    // 不存在校验方法
    if (!validateMethod) {
      return {
        validate: false,
        error: `不存在 ${type} 规则验证, 请手动添加`
      }
    }
    if (typeof validateMethod.message === "function") {
      validateMethod.message = validateMethod.message(params)
    }
    const replaceName = name || validateMethod.name || type
    const errorMsg = validateMethod.message.replace("{__field__}", replaceName.toString())
    const validateResult = validateMethod.validate(value, params)
    return {
      validate: validateResult,
      error: validateResult ? "" : errorMsg
    }
  }
  // 多验证方法
  const validateAll = (...args: Array<[Types, any, string?, any?]>) => {
    args = args.reverse();
    // 定义验证返回值
    let validatesResult: ValidateResult | undefined = undefined
    // 遍历验证, 当验证失败时跳出验证
    for (let i = 0; i < args.length; i++) {
      const [type, value, name, params] = args[i];
      const validateStatus = validate(type, value, name, params);
      if (!validateStatus.validate) {
        validatesResult = validateStatus;
        validatesResult.index = i
        errorHandleModular.errorHandle(validatesResult, args[i])
        continue;
      }
    }
    // 未找到则代表校验通过
    if (!validatesResult) {
      validatesResult = { validate: true, error: "" }
    }
    return validatesResult
  }
  const plotForm = {
    validate,
    validateAll,
    setErrorHandle:(callBack: SetErrorHandleCallBackType) => errorHandleModular.errorHandle = callBack
  }
  return plotForm
} 
/**
 * 封装的Math的工具类
 */
export default class Mathf {
    public static VEC_UP = new Laya.Vector3(0, 1, 0);

    public static Vec_Add(vec1, vec2): Laya.Vector3 {
        var vec3 = new Laya.Vector3();
        Laya.Vector3.add(vec1, vec2, vec3)
        return vec3;
    }

    public static Vec_Sub(vec1, vec2): Laya.Vector3 {
        var vec3 = new Laya.Vector3();
        Laya.Vector3.subtract(vec1, vec2, vec3)
        return vec3;
    }

    public static Vec_Mul(vec1, value): Laya.Vector3 {
        var vec3 = new Laya.Vector3();
        Laya.Vector3.multiply(vec1, new Laya.Vector3(value, value, value), vec3)
        return vec3;
    }

    public static Vec_Normalize(vec1): Laya.Vector3 {
        var vec3 = new Laya.Vector3();
        Laya.Vector3.normalize(vec1, vec3);
        return vec3;
    }

    public static VecToQua(vec1) {
        var qua = new Laya.Quaternion();
        /* yaw y的弧度值  pitch x的弧度值  roll z的弧度值
         * 角度A1转换弧度A2:A2=A1*PI/180
         * 弧度A2转换角度A1:A1=A2*180/PI
        */
        Laya.Quaternion.createFromYawPitchRoll(vec1.y * Math.PI / 180, vec1.x * Math.PI / 180, vec1.z * Math.PI / 180, qua);
        return qua;
    }

    public static VecDotQua(vec1, qua) {
        var vec3 = new Laya.Vector3();
        Laya.Vector3.transformQuat(vec1, qua, vec3);
        return vec3;
    }

    public static Clamp(tar, min, max): number {
        if (tar < min) {
            return min;
        }
        else if (tar > max) {
            return max;
        }
        else {
            return tar;
        }
    }

    public static ClampAngle(angle: number, min: number, max: number): number {
        if (angle < -360)
            angle = angle + 360;

        if (angle > 360)
            angle = angle - 360;

        return Mathf.Clamp(angle, min, max);
    }

    public static QuaToVec(qua): Laya.Vector3 {
        var vec = new Laya.Vector3();
        qua.getYawPitchRoll(vec);
        vec = new Laya.Vector3(vec.y * 180 / Math.PI, vec.x * 180 / Math.PI, vec.z * 180 / Math.PI);
        return vec;
    }

    public static GetToTargetRotation(targetVec): Laya.Quaternion {
        var qua = new Laya.Quaternion();
        Laya.Quaternion.rotationLookAt(targetVec, Mathf.VEC_UP, qua);
        return qua;
    }
}